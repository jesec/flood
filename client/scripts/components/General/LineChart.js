import d3 from 'd3';
import React from 'react';

const METHODS_TO_BIND = [
  'handleMouseLeave',
  'handleMouseOver',
  'handleMouseMove',
  'renderGraphData'
];

const bisector = d3.bisector(function(d) { return d; }).left;

export default class LineChart extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.graphRefs = {areDefined: false, isHovered: false};
    this.isInitialRender = true;
    this.lastMouseX = null;
    this.shouldUpdateGraph = true;
    this.xScale = {};
    this.yScale = {};
  }

  componentDidUpdate() {
    this.renderGraphData(this.props);

    if (this.graphRefs.isHovered) {
      try {
        this.renderPrecisePointInspector();
      } catch (err) {
        console.trace(err);
      }
    }
  }

  shouldComponentUpdate({data: nextData, limit: nextLimit}) {
    const {props: {data, limit: limits}} = this;

    if (data == null && nextData != null) {
      return true;
    }

    if (this.isInitialRender) {
      this.isInitialRender = false;
      return true;
    }

    return data.some((item, index) => {
      return item.speed !== nextData[index].speed;
    }) || limits.some((limit, index) => {
      return limit !== nextLimit[index];
    });
  }

  handleMouseLeave() {
    if (this.graphRefs.areDefined) {
      this.graphRefs.isHovered = false;
      this.graphRefs.inspectPoint.style('opacity', 0);
    }

    if (this.props.onGraphMouseLeave) {
      this.props.onGraphMouseLeave();
    }
  }

  handleMouseMove(event) {
    let mouseX = null;

    if (event && event.nativeEvent && event.nativeEvent.clientX != null) {
      mouseX = event.nativeEvent.clientX;
      this.lastMouseX = mouseX;
    } else {
      mouseX = this.lastMouseX;
    }

    this.renderPrecisePointInspector();
  }

  handleMouseOver() {
    this.graphRefs.isHovered = true;
    this.graphRefs.inspectPoint.style('opacity', 1);
  }

  renderGraphData({id, data, limit, width, height, slug}) {
    let speeds = data.map(snapshot => snapshot.speed);
    let graph = d3.select(`#${id}`);
    let margin = {bottom: 10, top: 10};

    this.xScale = d3.scale
      .linear()
      .domain([0, speeds.length - 1])
      .range([0, width]);

    this.yScale = d3.scale
      .linear()
      .domain([
        0,
        d3.max(speeds, (dataPoint, index) => {
          if (dataPoint >= limit[index]) {
            return dataPoint;
          }

          return limit[index];
        })
      ])
      .range([height - margin.top, margin.bottom]);

    let lineFunc = (interpolation) => {
      return d3
        .svg
        .line()
        .x((dataPoint, index) => this.xScale(index))
        .y(dataPoint => this.yScale(dataPoint))
        .interpolate(interpolation);
    };

    let areaFunc = (interpolation) => {
      return d3
      .svg
      .area()
      .x((dataPoint, index) => this.xScale(index))
      .y0(height)
      .y1(dataPoint => this.yScale(dataPoint))
      .interpolate(interpolation);
    };

    let transferDataLinePoints = lineFunc('cardinal')(speeds);
    let transferLimitLinePoints = lineFunc('step-after')(limit);
    let transferDataAreaPoints = areaFunc('cardinal')(speeds);

    if (!this.graphRefs.areDefined) {
      this.graphRefs.area = graph
        .append('path')
        .attr('class', 'graph__area')
        .attr('fill', `url('#${slug}--gradient')`);
      this.graphRefs.limitLine = graph
        .append('path')
        .attr('class', 'graph__line graph__line--limit');
      this.graphRefs.rateLine = graph
        .append('path')
        .attr('class', 'graph__line graph__line--rate');
      this.graphRefs.inspectPoint = graph
        .append('circle')
        .attr('class', 'graph__circle graph__circle--inspect')
        .attr('r', 2.5);

      this.graphRefs.areDefined = true;
    }

    this.graphRefs.area.attr('d', transferDataAreaPoints);
    this.graphRefs.limitLine.attr('d', transferLimitLinePoints);
    this.graphRefs.rateLine.attr('d', transferDataLinePoints);
  }

  renderPrecisePointInspector() {
    const {
      graphRefs: {inspectPoint},
      props: {data, onGraphHover},
      xScale,
      yScale,
    } = this;

    const hoverPoint = xScale.invert(this.lastMouseX);
    const upperSpeed = data[Math.ceil(hoverPoint)].speed;
    const lowerSpeed = data[Math.floor(hoverPoint)].speed;

    const delta = upperSpeed - lowerSpeed;
    const speedAtHoverPoint = lowerSpeed + (delta * (hoverPoint % 1));

    const coordinates = {x: xScale(hoverPoint), y: yScale(speedAtHoverPoint)};

    inspectPoint.attr(
      'transform', 'translate(' + coordinates.x + ',' + coordinates.y + ')'
    );

    const nearestTimestamp = data[Math.round(hoverPoint)].time;

    if (onGraphHover) {
      onGraphHover({
        speed: speedAtHoverPoint,
        time: nearestTimestamp
      });
    }
  }

  render() {
    return (
      <svg className="graph" id={this.props.id}
        onMouseMove={this.handleMouseMove}
        onMouseOut={this.handleMouseLeave}
        onMouseOver={this.handleMouseOver}
        ref={(ref) => this.graphRefs.graph = ref}>
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
