import d3 from 'd3';
import React from 'react';

export default class LineChart extends React.Component {

  constructor() {
    super();
  }

  componentWillUpdate() {
    let graph = d3.select('#' + this.props.id);
    let lineData = this.props.data;
    let margin = {
      bottom: 10,
      top: 10
    };
    let width = this.props.width;
    let height = this.props.height;

    let xRange = d3
      .scale
      .linear()
      .range([0, width])
      .domain([
        d3.min(lineData, function(d) {
          return d.x;
        }),
        d3.max(lineData, function(d) {
          return d.x;
        })
      ]);

    let yRange = d3
      .scale
      .linear()
      .range([height - margin.bottom - margin.top, 0])
      .domain([
        d3.min(lineData, function(d) {
          return d.y;
        }),
        d3.max(lineData, function(d) {
          return d.y;
        })
      ]);

    let lineFunc = d3
      .svg
      .line()
      .x(function(d) {
        return xRange(d.x);
      })
      .y(function(d) {
        return yRange(d.y);
      })
      .interpolate('basis');

    let areaFunc = d3
      .svg
      .area()
      .x(function(d) {
        return xRange(d.x);
      })
      .y0(height)
      .y1(function(d) {
        return yRange(d.y);
      })
      .interpolate('basis');

    let points = lineFunc(lineData);
    let area = areaFunc(lineData);

    graph
      .select('g')
      .remove();

    graph
      .append('g')
      .append('svg:path')
      .attr('class', 'graph--area')
      .attr('d', area)
      .attr('transform', 'translate(0,' + margin.top + ')');;

    graph
      .select('g')
      .append('svg:path')
      .attr('class', 'graph--line')
      .attr('d', points)
      .attr('transform', 'translate(0,' + margin.top + ')');
  }

  render() {
    return (
      <svg className="graph" id={this.props.id}>
        <defs>
          <linearGradient
            id={this.props.slug + '--gradient'}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%">
            <stop className={this.props.slug + '--gradient--top'} offset="0%"/>
            <stop className={this.props.slug + '--gradient--bottom'} offset="100%"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

}
