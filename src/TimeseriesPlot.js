var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

export default class TimeseriesPlot extends React.Component{
  constructor(props) {
    super(props);

    this.margin = {top: 10, right: 40, bottom: 30, left: 30}

  };
  // Returns a timeseries plot of the given dataset
  // Add this.props.data and this.plt.plotting_variable
  // Add CredibleInterval component

  //Add extra styling with bootstrap!

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

  Need to pass a color ref in the format: {'value', 'type', 'color'}

  */
  componentDidMount() {
      this.createTsPlot()
   }
   componentDidUpdate() {
      this.createTsPlot()
   }
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
  createTsPlot(){

    // Remove all plot content when plot is re-rendered
    d3.selectAll('#' + this.props.content_id).remove()

    // Find container dims
    var svg_dims = document.getElementById(this.props.container_id).getBoundingClientRect()

    // Add plot group to svg
    var svg = d3.select('#' + this.props.svg_id)
                .append('g')
                .attr('id', this.props.content_id)
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    // Get all CIs from the data keys
    var cis = this.getCIs(this.props.data)

    // Get the value of the highest CI
    var max_ci = d3.max(cis.map(ci => {return(ci['value'])}))

    // Y max is the max of the highest CI
    var y_max = d3.max(this.props.data.map(d => parseFloat(d['upper_' + max_ci])))

    // Define x scale
    var x = d3.scaleTime()
      .domain([this.props.min_date, this.props.max_date])
      .range([0, svg_dims.width]);

    // Define y scale
    var y = d3.scaleLinear()
      .domain([0,y_max])
      .range([svg_dims.height - this.margin.bottom, 0]);

    // Add x axis to plot
    var x_axis = svg.append("g")
       .attr("transform","translate(0,"+ (svg_dims.height - this.margin.bottom) +")")
       .call(d3.axisBottom(x).ticks(6).tickSize([0]))
       .attr("class",'time-xaxis');

    // Add y axis to plot
     var y_axis = svg.append("g")
       .call(d3.axisLeft(y))
       .attr("class", 'r0-yaxis');


    // Group data by estimate type
    var estimate_type_data = this.props.data.reduce((acc, item) => {

      if (!acc[item.type]) {
        acc[item.type] = [];
      }

      acc[item.type].push(item);
      return acc;

    }, {})

    // Extract credible interval polygons
    var ci_polys = Object.keys(estimate_type_data).map(key => {

      var polys = cis.map(ci => {
        return(this.credibleInterval(estimate_type_data[key], ci, x, y, key))
      })

      return({[key]:polys})

    })

    // Plot each polygon
    var ci_polys = ci_polys.reduce(((r, c) => Object.assign(r, c)), {});

    Object.keys(estimate_type_data).map(key => {

      ci_polys[key].map(poly => {

        var color = this.filter_color_ref(poly, this.props.ts_color_ref)['color']

        this.plotCIPoly(svg, estimate_type_data[key], poly['poly'], color)
      })
    })

  };
  filter_color_ref(poly, ref){

    ref = ref.map(ref => {if(poly.value == ref.value && poly.type == ref.type){return ref }})

    var ref = ref.filter(function(x) {
       return x !== undefined;
    });

    return(ref[0])

  }
  credibleInterval(data, ci, x, y, type){

    var ci_poly = d3.area()
      .x(function(d) { return x(new Date(Date.parse(d.date))) })
      .y0(function(d) { return y(d[ci['lower_name']])})
      .y1(function(d) { return y(d[ci['upper_name']])})


    return({'value': ci['value'], 'type': type, 'poly':ci_poly})

  };
  plotCIPoly(svg, data, poly, color){

    svg.append("path")
      .datum(data)
      .attr("d", poly)
      .attr("class", "ci-poly")
      .style('fill', color)
      .style('opacity', 0.5)

  }
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
      <div>
        <h2>{this.props.plot_title}</h2>
        <div id={this.props.container_id} style={container_style}>
          <svg id={this.props.svg_id} style={svg_style}>
          </svg>
        </div>
      </div>
    )
  }
}
