import d3 from 'd3';
import React from 'react';

const METHODS_TO_BIND = ['renderGraphData'];

export default class LineChart extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.renderGraphData();
  }

  componentDidUpdate() {
    this.renderGraphData();
  }

  renderGraphData() {
    let graph = d3.select('#' + this.props.id);
    let transferData = this.props.data;
    let transferLimit = this.props.limit;
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
        d3.min(transferData, (dataPoint, index) => {
          return index;
        }),
        d3.max(transferData, (dataPoint, index) => {
          return index;
        })
      ]);

    let yRange = d3
      .scale
      .linear()
      .range([height - margin.top, margin.bottom])
      .domain([
        0,
        d3.max(transferData, (dataPoint, index) => {
          if (dataPoint >= transferLimit[index]) {
            return dataPoint;
          } else {
            return transferLimit[index];
          }
        })
      ]);

    let lineFunc = (interpolation) => {
      return d3
        .svg
        .line()
        .x((dataPoint, index) => {
          return xRange(index);
        })
        .y((dataPoint) => {
          return yRange(dataPoint);
        })
        .interpolate(interpolation);
    };

    let areaFunc = d3
      .svg
      .area()
      .x((dataPoint, index) => {
        return xRange(index);
      })
      .y0(height)
      .y1((dataPoint) => {
        return yRange(dataPoint);
      })
      .interpolate('basis');

    let transferDataLinePoints = lineFunc('basis')(transferData);
    let transferLimitLinePoints = lineFunc('step-after')(transferLimit);
    let transferDataAreaPoints = areaFunc(transferData);

    graph
      .select('g')
      .remove();

    graph
      .append('g')
      .append('svg:path')
      .attr('class', 'graph__area')
      .attr('d', transferDataAreaPoints);

    graph
      .select('g')
      .append('svg:path')
      .attr('class', 'graph__line graph__line--limit')
      .attr('d', transferLimitLinePoints);

    graph
      .select('g')
      .append('svg:path')
      .attr('class', 'graph__line graph__line--rate')
      .attr('d', transferDataLinePoints);
  }

  render() {
    return (
      <svg className="graph" id={this.props.id}>
        <defs>
          <linearGradient id={`${this.props.slug}--gradient`} x1="0%" y1="0%"
            x2="0%" y2="100%">
            <stop className={`${this.props.slug}--gradient--top`} offset="0%"/>
            <stop className={`${this.props.slug}--gradient--bottom`} offset="100%"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

}
