var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

export default class MapLegend extends React.Component{
  constructor(props) {
    super(props);

  };
  create_map_legend(){

    if (this.props.active_map_legend['legend_type'] === 'sequential'){
      var scale_sequential = this.props.create_sequential_legend(this.props.summaryData, this.props.active_map_legend)
    }

    if (this.props.active_map_legend['legend_type'] === 'qualitative'){

      this.create_qualitative_legend(this.props.active_map_legend)

    } else if (this.props.active_map_legend['legend_type'] === 'sequential'){

      this.create_sequential_legend(scale_sequential, this.props.active_map_legend)

    }

  }
  create_qualitative_legend(legend_ref){

    d3.selectAll('#legend-item').remove()
    d3.selectAll('#legend-item-group').remove()

    Object.keys(legend_ref['legend_values']).map(key => {

      var group = d3.select('#map-legend')
        .append('div')
        .attr('id', 'legend-item-group')
        .attr('class', 'row pl-3')

      group
        .append('div')
        .attr('id', 'legend-item')
        .attr('class', 'pl-2 pr-1')
        .text(key + ':')

      group
        .append('div')
        .attr('class', 'pr-4 pt-2')
        .append('div')
        .attr('id', 'legend-item')
        .style('width', '10px')
        .style('height', '10px')
        .style('background-color', legend_ref['legend_values'][key])
    })

  }
  create_sequential_legend(scale, legend_ref){

    d3.selectAll('#legend-item').remove()
    d3.selectAll('#legend-item-group').remove()

    //Get 5 representative values between min and max
    var scale_min = scale.domain()[0]
    var scale_max = scale.domain()[1]

    var scale_range = scale_max - scale_min

    var index = [0, 1, 2, 3, 4]

    var legend_values = index.map(i => {return(scale_min + ((scale_range / 4) * i))})

    var legend_colors = legend_values.map(value => {return(scale(value))})

    index.map(i => {

      var group = d3.select('#map-legend')
        .append('div')
        .attr('id', 'legend-item-group')
        .attr('class', 'row pl-3')

      group
        .append('div')
        .attr('id', 'legend-item')
        .text(legend_values[i] + ':')
        .attr('class', 'pl-2 pr-1')

      group
        .append('div')
        .attr('class', 'pr-4 pt-2')
        .append('div')
        .attr('id', 'legend-item')
        .style('width', '10px')
        .style('height', '10px')
        .style('background-color', legend_colors[i])
    })



  }
  componentDidMount() {
      this.create_map_legend()
   }
   componentDidUpdate() {
      this.create_map_legend()
   }

  render() {
    const container_style = {
      width: "100%",
      height: "100%"
    };
    return(
      <div className="d-flex justify-content-end" id='map-legend' style={container_style}></div>
    )
  }
}
