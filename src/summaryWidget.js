var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

import TimeseriesPlot from './TimeseriesPlot';
import Map from './Map';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import CountrySelect from './CountrySelect';
import TimeseriesLegend from './TimeseriesLegend';

export default class SummaryWidget extends React.Component{
  constructor(props) {
    super(props);

    this.state = {active_area: 'United Kingdom',
                  active_source: 'Cases',
                  active_map_legend: null,
                  min_date: null,
                  max_date: null,
                  rtData: {},
                  geoData: null};

  };

  componentWillMount() {

    // Default to the first map legend
    this.setState({active_map_legend: this.props.x.map_legend_ref[0]})

    this.props.x.geoData.then(data => {
      this.setState({geoData: data})
    })

    //rtData is nested recursively
    Object.keys(this.props.x.rtData).map((key, index) => {

      this.state.rtData[key] = new Object;

      Object.keys(this.props.x.rtData[key]).map((sub_key, sub_index) => {

        this.props.x.rtData[key][sub_key].then(data => {

          // setState needs to be called for nested state
          this.setState(prevState => ({
              rtData: {
                  ...prevState.rtData,
                  [key]: {
                      ...prevState.rtData[key],
                      [sub_key]: data
                  }
              }
          }))

          // Also setting the min and max dates of the active area here
          if (['rtData', 'casesInfectionData', 'casesReportData'].includes(sub_key)){

            var min_date = d3.min(this.get_dates(this.filterData(this.state.active_area, data)))
            var max_date = d3.max(this.get_dates(this.filterData(this.state.active_area, data)))

            this.setState({min_date: min_date, max_date: max_date})

          }

          }

        )

      })
    })
  };
  update_legend_state(){

    var selected_variable = document.getElementById('map-data-selection');
    selected_variable = selected_variable.options[selected_variable.selectedIndex].value

    var active_map_legend = this.props.x.map_legend_ref.filter(legend => {
      return legend['variable_name'] == selected_variable
    })[0]

    this.setState({active_map_legend: active_map_legend})

  }
  update_region_state(){

    var selected_variable = document.getElementById('region-data-selection');
    selected_variable = selected_variable.options[selected_variable.selectedIndex].value

    this.setState({active_area: selected_variable})

  }
  update_source_state(){

    var selected_variable = document.getElementById('source-data-selection');
    selected_variable = selected_variable.options[selected_variable.selectedIndex].value

    this.setState({active_source: selected_variable})

  }
  get_dates(data){

    var dates = data.map(data => {return(new Date(Date.parse(data.date)))})

    return dates

  }
  filterData(region, input, filter_var='region'){
    // Filters an array for an arbitrary value by an arbitrary column

    var input_keys = Object.keys(input[0])

    // Add flexibility for the most common filtered variables. Assumes there is only one of these per dataset
    if (input_keys.includes('region')){
      filter_var = 'region'
    } else if (input_keys.includes('country')){
      filter_var = 'country'
    } else if (input_keys.includes('Country')){
      filter_var = 'Country'
    } else if (input_keys.includes('Region')){
      filter_var = 'Region'
    }

    var filtered = input.filter(function (e) {
        return e[filter_var] == region;
    });

    return ( filtered )

  }
  create_sequential_legend(summaryData, legend_ref){

    var legend_scale = d3[legend_ref['legend_scale']]()
      .range([legend_ref['legend_values']['low'], legend_ref['legend_values']['high']])

    var summary_values = summaryData.map((d => {
        return(parseFloat(d[legend_ref['variable_name']].split(' ')[0]))
    }))

    var legend_max = d3.max(summary_values)
    var legend_min = d3.min(summary_values)

    legend_scale.domain([legend_min,legend_max])

    return(legend_scale)
  }

  render() {

    if (Object.keys(this.state.rtData[this.state.active_source]).length <= 3) {

      return(
          <h1>Loading Data</h1>
      )

    } else {
      var activeRtData = this.filterData(this.state.active_area, this.state.rtData[this.state.active_source]['rtData'])
      var activeCasesInfectionData = this.filterData(this.state.active_area, this.state.rtData[this.state.active_source]['casesInfectionData'])
      var activeCasesReportData = this.filterData(this.state.active_area, this.state.rtData[this.state.active_source]['casesReportData'])

      const plot_height = '200px'
      const map_height = 600

      return(
        <div>
        <Map container_id='map-container'
             svg_id='map-svg'
             content_id='map-content'
             width='100%'
             height= {map_height + 'px'}
             geoData={this.state.geoData}
             summaryData={this.state.rtData[this.state.active_source]['summaryData']}
             projection={this.props.x.projection}
             legend_ref={this.state.active_map_legend}
             create_sequential_legend={this.create_sequential_legend}
             area_click_handler={function(x){this.setState({active_area: x})}.bind(this)}>
        </Map>
        <div className="d-flex justify-content-around">
          <MapControls legend_ref={this.props.x.map_legend_ref}
                       select_handler={this.update_legend_state.bind(this)}>
          </MapControls>
          <MapLegend active_map_legend={this.state.active_map_legend}
                     summaryData={this.state.rtData[this.state.active_source]['summaryData']}
                     create_sequential_legend={this.create_sequential_legend}>
          </MapLegend>
        </div>
        <CountrySelect summaryData={this.state.rtData[this.state.active_source]['summaryData']}
                       data_sources={Object.keys(this.state.rtData)}
                       active_area={this.state.active_area}
                       select_handler={this.update_region_state.bind(this)}
                       source_select_handler={this.update_source_state.bind(this)}>
        </CountrySelect>
        <TimeseriesPlot container_id='r-container'
                        svg_id='r-svg'
                        content_id='r-content'
                        plot_title='R'
                        width='100%'
                        height={plot_height}
                        active_area={this.state.active_area}
                        min_date={this.state.min_date}
                        max_date={this.state.max_date}
                        ts_color_ref={this.props.x.ts_color_ref}
                        data={activeRtData}
                        map_height={map_height}>
        </TimeseriesPlot>
        <TimeseriesPlot container_id='infection-container'
                        svg_id='infection-svg'
                        content_id='infection-content'
                        plot_title='Cases by date of infection'
                        width='100%'
                        height={plot_height}
                        active_area={this.state.active_area}
                        min_date={this.state.min_date}
                        max_date={this.state.max_date}
                        ts_color_ref={this.props.x.ts_color_ref}
                        data={activeCasesInfectionData}
                        map_height={map_height}>
        </TimeseriesPlot>
        <TimeseriesPlot container_id='report-container'
                        svg_id='report-svg'
                        content_id='report-content'
                        plot_title='Cases by date of report'
                        width='100%'
                        height={plot_height}
                        active_area={this.state.active_area}
                        min_date={this.state.min_date}
                        max_date={this.state.max_date}
                        ts_color_ref={this.props.x.ts_color_ref}
                        data={activeCasesReportData}
                        map_height={map_height}>
        </TimeseriesPlot>
        <TimeseriesLegend ts_color_ref={this.props.x.ts_color_ref}>
        </TimeseriesLegend>
        </div>
      )
    }
  }
}
