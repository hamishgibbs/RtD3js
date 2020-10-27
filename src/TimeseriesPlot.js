var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

import PlotContainer from './PlotContainer';
import TsPlotAxis from './TsPlotAxis';

export default class TimeseriesPlot extends React.Component{
  constructor(props) {
    super(props);

    this.margin = {top: 0, right: 40, bottom: 10, left: 10}

  };
  // Returns a timeseries plot of the given dataset
  // Add this.props.data and this.plt.plotting_variable
  // Add CredibleInterval component
  /*
  Should be in the format:

  for cases by:
  <Plot>
    <BarPlot></BarPlot>
    for every slice of data:
    <CredibleInterval></CredibleInterval>
  </Plot>

  for R by:
  <Plot>
    for every slice of data:
    <CredibleInterval></CredibleInterval>
    <VLine></VLine>
  </Plot>

  For an arbitrary number of credible intervals at arbitrary locations - use a regex to match keys and values

  */
  getCIs(data){
    var ci = Object.keys(data[0]).map(key => {return this.parseCI(key)})

    var ci = ci.filter(function(x) {return x !== undefined;});

    return(ci)

  }
  parseCI(key){
    // Parse ci from a column header - assumes that every `lower_` column has a coreresonding `upper_` column header

    if (key.includes('lower_')){

      var type = null

      if (key.includes('lower_')){
        type = 'lower'
      }

      var value = key.match(/\d+/g).map(Number)[0]

      return({value: value, lower_name: 'lower_' + value, upper_name: 'upper_' + value})
    } else {
      return(undefined)
    }

  }
  render() {
    return (
      <div>
        <PlotContainer container_id={this.props.container_id} svg_id={this.props.svg_id} width={this.props.width} height={this.props.height}>
        </PlotContainer>
        <TsPlotAxis container_id={this.props.container_id} svg_id={this.props.svg_id} margin={this.margin} min_date={this.props.min_date} max_date={this.props.max_date}>
        </TsPlotAxis>
      </div>
    )
  }
}
