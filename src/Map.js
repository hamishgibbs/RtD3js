var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

export default class Map extends React.Component{
  constructor(props) {
    super(props);

    this.margin = {top: 10, right: 40, bottom: 30, left: 30}

  };
  createMap(){

    d3.selectAll('#' + this.props.content_id).remove()

    var svg_dims = document.getElementById(this.props.container_id).getBoundingClientRect()

    const projection = d3[this.props.projection]()
      .fitSize([svg_dims.width, svg_dims.height], this.props.geoData);

    var path = d3.geoPath().projection(projection);

    var svg = d3.select('#' + this.props.svg_id)
                .append('g')
                .attr('id', this.props.content_id)
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    var g = svg.append("g")
      		.attr("class", "countries")

    if (this.props.legend_ref['legend_type'] === 'sequential'){
      var scale_sequential = this.create_sequential_legend(this.props.summaryData, this.props.legend_ref)
    }

    g.selectAll("path")
        .data(this.props.geoData.features)
        .enter().append("path")
          .attr("d", path)
          .attr('region-name', (feature => {
            return(feature.properties.sovereignt)
          }))
      		.attr('fill', (feature => {

            var feature_name = feature.properties.sovereignt

            if (this.props.legend_ref['legend_type'] === 'qualitative'){
              return(this.qualitative_fill(feature_name, this.props.summaryData, this.props.legend_ref))
            } else if (this.props.legend_ref['legend_type'] === 'sequential'){
              return(this.sequential_fill(feature_name, this.props.summaryData, scale_sequential, this.props.legend_ref))
            }

          }))
      		.attr('stroke', '#333')
          .on('mousemove', (e => {

            var hovered_feature = this.props.geoData.features.map(feature => {
              //console.log(feature.geometry)
              if (d3.geoContains(feature.geometry, projection.invert([e.clientX, e.clientY]))){
                return(feature)
              }

            })

            var hovered_feature = hovered_feature.filter(function(x) {
               return x !== undefined;
            })[0];

            d3.select('#' + this.props.container_id + '-tooltip')
              .style("left", (e.clientX + 40) + "px")
              .style("top", (e.clientY) + "px")
              .html(hovered_feature.properties.sovereignt)
          }))
          .on('mouseenter', (e => {
            d3.select('#' + this.props.container_id + '-tooltip')
              .style("opacity", 1)
          }))
          .on('mouseout', (e => {
            d3.select('#' + this.props.container_id + '-tooltip')
              .style("opacity", 0)
          }));

     d3.select("#" + this.props.container_id)
       .append("div")
       .style("opacity", 0)
       .attr("class", 'tooltip')
       .attr('id', this.props.container_id + '-tooltip')
       .style('position', 'absolute')

    var zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function(e) {
          
          g.selectAll('path')
           .attr('transform', e.transform);
      });

    svg.call(zoom);

  }
  create_sequential_legend(summaryData, legend_ref){

    var legend_scale = d3[legend_ref['legend_scale']]()
      .range([legend_ref['legend_values']['low'], legend_ref['legend_values']['high']])

    var summary_values = summaryData.map((d => {
        return(parseFloat(d[legend_ref['variable_name']].split(' ')[0]))
    }))

    var legend_max = d3.max(summary_values)
    var legend_min = d3.min(summary_values)

    legend_scale.domain([legend_min,legend_max])

    return(legend_scale)
  }
  sequential_fill(feature_name, summaryData, legend_scale, legend_ref){

    var summary_data = summaryData.filter(function(d){
      if (d.Country == feature_name){
        return(
          d
        )
      }
    })

    try {
      var summary_value = parseFloat(summary_data[0][legend_ref['variable_name']].split(' ')[0])

      return(legend_scale(summary_value))

    } catch {

      return(legend_ref['legend_values']['No Data'])

    }



  }
  qualitative_fill(feature_name, summaryData, legend_ref){

    var summary_data = summaryData.filter(function(d){
      if (d.Country == feature_name){
        return(
          d
        )
      }
    })

    try {
      return(
        legend_ref['legend_values'][summary_data[0][legend_ref['variable_name']]]
      )
    } catch {
      return(
        legend_ref['legend_values']['No Data']
      )
    }

  }
  componentDidMount() {
      this.createMap()
   }
   componentDidUpdate() {
      this.createMap()
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
    return(
      <div id={this.props.container_id} style={container_style}>
        <svg id={this.props.svg_id} style={svg_style}>
        </svg>
      </div>
    )
  }
}
