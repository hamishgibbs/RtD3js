var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

export default class TsPlotAxis extends React.Component{
  constructor(props) {
    super(props);
  };

  setupPlot(){

    var svg_dims = document.getElementById(this.props.container_id).getBoundingClientRect()

    var svg = d3.select('#' + this.props.svg_id)
      .append('g')
      .attr('class', 'ts-plot-content')
      .attr("transform", "translate(" + this.props.margin.left + "," + this.props.margin.top + ")")

    var x = d3.scaleTime()
      .domain([this.props.min_date, this.props.max_date])
      .range([0, svg_dims.width]);

  }
  render() {

    console.log("I'm rendering!")

    this.setupPlot()

    return(
      <g></g>
    )
  }

}
