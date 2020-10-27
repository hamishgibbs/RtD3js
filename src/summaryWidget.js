var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

import TimeseriesPlot from './TimeseriesPlot';

export default class SummaryWidget extends React.Component{
  constructor(props) {
    super(props);

    this.state = {active_area: 'United Kingdom',
                  active_source: 'Cases',
                  min_date: null,
                  max_date: null,
                  rtData: {}};

  };

  componentWillMount() {

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
  get_dates(data){

    var dates = data.map(data => {return(new Date(Date.parse(data.date)))})

    return dates

  }
  filterData(region, input, filter_var='country'){
    // Filters an array for an arbitrary value by an arbitrary column

    var filtered = input.filter(function (e) {
        return e[filter_var] == region;
    });

    return ( filtered )

  }

  render() {

    if (Object.keys(this.state.rtData[this.state.active_source]).length <= 3) {

      return(
          <h1>Loading Data</h1>
      )

    } else {
      var activeRtData = this.filterData(this.state.active_area, this.state.rtData[this.state.active_source]['rtData'])

      return(
        <TimeseriesPlot container_id='r-container'
                        svg_id='r-svg'
                        width='100%'
                        height='250px'
                        active_area={this.state.active_area}
                        min_date={this.state.min_date}
                        max_date={this.state.max_date}
                        data={activeRtData}>
        </TimeseriesPlot>
      )
    }
  }
}
