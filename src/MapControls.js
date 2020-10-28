var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

export default class MapControls extends React.Component{
  render() {

    var legend_options = []
    this.props.legend_ref.map(item => {
      legend_options.push(<option>{item['variable_name']}</option>)
    })

    return (
        <div>
          <select className="form-control" id="map-data-selection" onChange={this.props.select_handler}>
            {legend_options}
          </select>
        </div>
    )
  }
}
