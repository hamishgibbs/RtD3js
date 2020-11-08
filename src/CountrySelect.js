var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

export default class CountrySelect extends React.Component{
  constructor(props) {
    super(props);

  };
  render() {

    var region_options = []
    this.props.summaryData.map(item => {
      region_options.push(<option>{item[this.props.data_ref['summaryData']['geometry_name']]}</option>)
    })

    var source_options = []
    this.props.data_sources.map(item => {
      source_options.push(<option>{item}</option>)
    })

    const select_style = {
      width: '200px',
    };
    return(
      <div className="d-flex justify-content-between pt-3">
          <select className="form-control" id="region-data-selection" onChange={this.props.select_handler} style={select_style}>
            {region_options}
          </select>
          <h4>{this.props.active_area}</h4>
          <select className="form-control" id="source-data-selection" onChange={this.props.source_select_handler} style={select_style}>
            {source_options}
          </select>
      </div>
    )
  }
}
