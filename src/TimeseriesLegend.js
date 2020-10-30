var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

export default class TimeseriesLegend extends React.Component{
  constructor(props) {
    super(props);

  };
  render() {

    d3.selectAll('#ts-legend-item').remove()
    d3.selectAll('#ts-legend-item-group').remove()

    // Group data by estimate type
    var estimate_type_data = this.props.ts_color_ref.reduce((acc, item) => {

      if (!acc[item.type]) {
        acc[item.type] = [];
      }

      acc[item.type].push(item);
      return acc;

    }, {})

    // Choose an arbitrary color from each category
    var legend_items = Object.keys(estimate_type_data).map(key => {
      return(estimate_type_data[key][0])
    })

    legend_items.map(item => {

      var group = d3.select('#ts-legend')
        .append('div')
        .attr('id', 'ts-legend-item-group')
        .attr('class', 'row pl-2 pr-1 bg-light')

      group
        .append('div')
        .attr('id', 'ts-legend-item')
        .attr('class', 'pl-2 pr-1')
        .text(item['type'] + ':')

      group
        .append('div')
        .attr('class', 'pr-4 pt-2')
        .append('div')
        .attr('id', 'ts-legend-item')
        .style('width', '10px')
        .style('height', '10px')
        .style('background-color', item['color'])
    })

    const container_style = {
      width: "100%",
      height: "40px"
    };

    return(
      <div className='row'>
        <div className="d-flex justify-content-end" id='ts-legend' style={container_style}></div>
      </div>
    )
  }
}
