var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

export default class PlotContainer extends React.Component{
  // Returns an svg plot container within a div container

  render() {
    const container_style = {
      width: this.props.width,
      height: this.props.height
    };
    const svg_style = {
      width: "100%",
      height: "100%"
    };
    return (
        <div id={this.props.container_id} style={container_style}>
          <svg id={this.props.svg_id} style={svg_style}>
          </svg>
        </div>
    )
  }
}
