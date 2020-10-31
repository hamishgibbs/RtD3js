var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

export default class TimeseriesPlot extends React.Component{
  constructor(props) {
    super(props);

    this.margin = {top: 10, right: 40, bottom: 30, left: 60}

    this.active_x = null

  };
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

    // Function to update component acitve x scale
    function updateX(x){

      this.active_x = x

    }

    // Bind method to this instance of the component
    var x_updated = updateX.bind(this)

    // Remove all plot content when plot is re-rendered
    d3.selectAll('#' + this.props.content_id).remove()
    d3.selectAll('#' + this.props.container_id + '-tooltip').remove()

    // Find container dims
    var svg_dims = document.getElementById(this.props.container_id).getBoundingClientRect()

    // Add plot group to svg
    var svg = d3.select('#' + this.props.svg_id)
                .append('g')
                .attr('id', this.props.content_id)
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    if (this.props.data.length == 0){

      svg.append('text')
        .attr('id', '#' + this.props.content_id)
        .text('No Data')
        .style('fill', 'lightgrey')
        .style('font-weight', 'bold')
        .attr('y', svg_dims.height / 2)
        .attr('x', svg_dims.width / 2.5)

      return(null)

    }

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

    x_updated(x)

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

     var clip = svg.append("defs").append("svg:clipPath")
       .attr("id", "clip")
       .append("svg:rect")
       .attr("width", svg_dims.width )
       .attr("height", svg_dims.height )
       .attr("x", 0)
       .attr("y", 0);

     var plot_content = svg.append('g')
      .attr("clip-path", "url(#clip)")

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

        this.plotCIPoly(plot_content, estimate_type_data[key], poly['poly'], color, poly['value'])
      })
    })

    if (this.props.hline_intercept !== undefined){

      this.plot_hline(plot_content, this.props.data, this.props.hline_intercept, x, y)

    }

    if (this.props.obsCasesData !== undefined){

      this.plot_obs_bars(plot_content, this.props.obsCasesData, svg_dims, this.props.ts_bar_color, x, y)

    }

    var zoom = d3.zoom()
      .scaleExtent([.5, 20])
      .extent([[0, 0], [svg_dims.width, svg_dims.height]])
      .on("zoom", updateChart);

    d3.select("#" + this.props.container_id)
      .append("div")
      .style("opacity", 0)
      .attr("class", 'tooltip')
      .attr('id', this.props.container_id + '-tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid black')
      .style('border-radius', '15px')
      .style('padding', '5px')

    svg.append('line')
      .attr('id', this.props.container_id + '-hover-line')
      .attr("x1", 20)
      .attr("y1", 0)
      .attr("x2", 20)
      .attr("y2", svg_dims.height)
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .attr('stroke-opacity', 0);

    svg.append("rect")
      .attr("width", svg_dims.width)
      .attr("height", svg_dims.height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .call(zoom)
      .on('mousemove', (e => {
        var hovered_x = this.active_x.invert(e.clientX)

        var hovered_x_formatted = hovered_x.toISOString().slice(0,10)

        var hover_data = this.props.data.filter(function(x) {
          if (x.date === hovered_x_formatted){
              return x;
          }
        })[0];

        var tooltip_string = this.format_tooltip_string(hover_data, cis)

        d3.select('#' + this.props.container_id + '-tooltip')
          .style("left", (e.clientX + 40) + "px")
          .style("top", (e.clientY + this.props.map_height - 200) + "px")
          .html(tooltip_string)

        d3.select('#' + this.props.container_id + '-hover-line')
          .attr('x1', e.clientX - 60)
          .attr('x2', e.clientX - 60)

      }))
      .on('mouseenter', (e => {
        d3.select('#' + this.props.container_id + '-tooltip')
          .style("opacity", 1)

        d3.select('#' + this.props.container_id + '-hover-line')
          .attr('stroke-opacity', 1)
      }))
      .on('mouseout', (e => {
        d3.select('#' + this.props.container_id + '-tooltip')
          .style("opacity", 0)

        d3.select('#' + this.props.container_id + '-hover-line')
          .attr('stroke-opacity', 0)
      }));


    var hline_intercept = this.props.hline_intercept

    function updateChart(e){

      var newX = e.transform.rescaleX(x);
      var newY = e.transform.rescaleY(y);

      x_axis.call(d3.axisBottom(newX))
      y_axis.call(d3.axisLeft(newY))

      x_updated(newX)

      try {
        plot_content
          .selectAll('#cases_bar')
          .attr('x', function(d, i) {return newX(new Date(Date.parse(d.date)), -0.5);})
          .attr("width", function(d) {return 0.8 * (newX(d3.timeDay.offset(new Date(Date.parse(d.date)), 1)) - newX(new Date(Date.parse(d.date))))})
          .attr('height', function(d, i) {return newY(0) - newY(d.confirm);})
          .attr('y', function(d, i) {return newY(d.confirm);})
      } catch {}

      try {

        var hline = d3.line()
          .x(function(d){ return newX(new Date(Date.parse(d.date))); })
          .y(function(d){ return newY(hline_intercept); })
          .curve(d3.curveCardinal);

        plot_content
          .selectAll('#r-line')
          .attr("d", function(d){

            return(hline(d))

          })

      } catch {}

      plot_content
        .selectAll("#ci-poly")
        .attr('d', function(d) {

          var ci_value = d3.select(this).attr('ci_value')

          var new_poly = d3.area()
            .x(function(d) { return newX(new Date(Date.parse(d.date))) })
            .y0(function(d) { return newY(d['lower_' + ci_value])})
            .y1(function(d) { return newY(d['upper_' + ci_value])})

          return (
            new_poly(d)
          )

        })
    }

  };
  format_tooltip_string(hover_data, cis){

    var sep = '</br>'

    var hover_str = '<b>' + hover_data['country'] + '</b>' + sep + '<b>' + hover_data['date'] + '</b>'

    hover_str = hover_str + cis.map(ci => {
      return(sep + '<b>' +ci['value'] + '% CI: </b>' + hover_data[ci['lower_name']] + ' - ' + hover_data[ci['upper_name']])
    })

    return(hover_str)

  }
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
  plotCIPoly(svg, data, poly, color, ci_value){

    svg.append("path")
      .datum(data)
      .attr("d", poly)
      .attr("id", "ci-poly")
      .attr("ci_value", ci_value)
      .style('fill', color)
      .style('opacity', 0.5)

  }
  plot_hline(svg, data, intercept, x, y){

    var hline = d3.line()
      .x(function(d){ return x(new Date(Date.parse(d.date))); })
      .y(function(d){ return y(intercept); })
      .curve(d3.curveCardinal);

      svg.append("path")
        .datum(data)
        .attr("d", hline)
        .attr("id", 'r-line')
        .style('stroke', 'black')
        .style('stroke-dasharray', "5,5")

  }
  plot_obs_bars(svg, data, svg_dims, ts_bar_color, x, y){

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function(d, i) {return x(new Date(Date.parse(d.date)), -0.5);})
        .attr("width", function(d) {return 0.8 * (x(d3.timeDay.offset(new Date(Date.parse(d.date)), 1)) - x(new Date(Date.parse(d.date))))})
        .attr("height", 0)
        .attr("y", svg_dims.height)
        .style('fill', ts_bar_color)
        .style('opacity', 0.5)
        .transition()
        .duration(250)
        .delay(function (d, i) {
          return i * 4;
        })
        .attr('height', function(d, i) {return y(0) - y(d.confirm);})
        .attr('y', function(d, i) {return y(d.confirm);})
        .attr('id', 'cases_bar');
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
        <h5>{this.props.plot_title}</h5>
        <div id={this.props.container_id} style={container_style}>
          <svg id={this.props.svg_id} style={svg_style}>
          </svg>
        </div>
      </div>
    )
  }
}
