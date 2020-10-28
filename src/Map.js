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
      var scale_sequential = this.props.create_sequential_legend(this.props.summaryData, this.props.legend_ref)
    }

    var update_area = this.props.area_click_handler

    var data = this.props.summaryData
    var container_id = this.props.container_id

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
          .on('mousemove', function(e){
            var hovered_name = d3.select(this).attr('region-name')

            var hovered_data = data.filter(d => {
              return( d.Country == hovered_name)
            })

            try {
              d3.select('#' + container_id + '-tooltip')
                .style("left", (e.clientX + 40) + "px")
                .style("top", (e.clientY) + "px")
                .html(hovered_data[0].Country)
            } catch {
              d3.select('#' + container_id + '-tooltip')
                .style("opacity", 0)
            }
          })
          .on('mouseenter', (e => {
            d3.select('#' + this.props.container_id + '-tooltip')
              .style("opacity", 1)
          }))
          .on('mouseout', (e => {
            d3.select('#' + this.props.container_id + '-tooltip')
              .style("opacity", 0)
          }))
          .on('click', function(e){
            update_area(d3.select(this).attr('region-name'))
          });

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
