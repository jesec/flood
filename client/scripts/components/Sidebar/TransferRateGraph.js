import _ from 'underscore';
import d3 from 'd3';
import React from 'react';

const METHODS_TO_BIND = [
  'appendGraphCircles',
  'appendEmptyGraphShapes',
  'handleMouseOut',
  'handleMouseOver',
  'handleMouseMove',
  'renderGraphData'
];

const bisector = d3.bisector(function(d) { return d; }).left;

class LineChart extends React.Component {
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

  shouldComponentUpdate(nextProps) {
    if (this.isInitialRender) {
      this.isInitialRender = false;
      return true;
    }

    const {props: {historicalData}} = this;
    const {historicalData: {upload, download}} = nextProps;

    return upload.some((item, index) => {
      return item !== historicalData.upload[index];
    }) || download.some((item, index) => {
      return item !== historicalData.download[index];
    });
  }

  componentDidUpdate() {
    this.renderGraphData(this.props);

    if (this.graphRefs.isHovered) {
      this.renderPrecisePointInspectors();
    }
  }

  handleMouseOut() {
    const {graphRefs, props} = this;

    if (graphRefs.areDefined) {
      graphRefs.isHovered = false;
      graphRefs.upload.inspectPoint.style('opacity', 0);
      graphRefs.download.inspectPoint.style('opacity', 0);
    }

    if (props.onMouseOut) {
      props.onMouseOut();
    }
  }

  handleMouseMove(mouseX) {
    this.lastMouseX = mouseX;
    this.renderPrecisePointInspectors();
  }

  handleMouseOver() {
    this.graphRefs.isHovered = true;
    this.graphRefs.upload.inspectPoint.style('opacity', 1);
    this.graphRefs.download.inspectPoint.style('opacity', 1);
  }

  appendGraphCircles(graph, slug) {
    this.graphRefs[slug].inspectPoint = graph
      .append('circle')
      .attr('class', `graph__circle graph__circle--${slug}`)
      .attr('r', 2.5);
  }

  appendEmptyGraphShapes(graph, slug) {
    if (this.graphRefs[slug] == null) {
      this.graphRefs[slug] = {};
    }

    this.graphRefs[slug].area = graph
      .append('path')
      .attr('class', 'graph__area')
      .attr('fill', `url('#graph__gradient--${slug}')`);
  }

  appendEmptyGraphLines(graph, slug) {
    this.graphRefs[slug].rateLine = graph
      .append('path')
      .attr('class', `graph__line graph__line--${slug}`);
  }

  renderGraphData(props) {
    const {height, historicalData, id, width} = props;
    const graph = d3.select(`#${id}`);
    const margin = {bottom: 10, top: 10};

    this.xScale = d3.scale
      .linear()
      .domain([0, historicalData.download.length - 1])
      .range([0, width]);

    this.yScale = d3.scale
      .linear()
      .domain([
        0,
        d3.max(historicalData.download, (dataPoint, index) => {
          return Math.max(dataPoint, historicalData.upload[index]);
        })
      ])
      .range([height - margin.top, margin.bottom]);

    const lineFunc = (interpolation) => {
      return d3
        .svg
        .line()
        .x((dataPoint, index) => this.xScale(index))
        .y(dataPoint => this.yScale(dataPoint))
        .interpolate(interpolation);
    };

    const areaFunc = (interpolation) => {
      return d3
      .svg
      .area()
      .x((dataPoint, index) => this.xScale(index))
      .y0(height)
      .y1(dataPoint => this.yScale(dataPoint))
      .interpolate(interpolation);
    };

    const downloadLinePath = lineFunc('cardinal')(historicalData.download);
    const downloadAreaShape = areaFunc('cardinal')(historicalData.download);
    const uploadLinePath = lineFunc('cardinal')(historicalData.upload);
    const uploadAreaShape = areaFunc('cardinal')(historicalData.upload);

    if (!this.graphRefs.areDefined) {
      this.appendEmptyGraphShapes(graph, 'download');
      this.appendEmptyGraphShapes(graph, 'upload');
      this.appendEmptyGraphLines(graph, 'download');
      this.appendEmptyGraphLines(graph, 'upload');
      this.appendGraphCircles(graph, 'download');
      this.appendGraphCircles(graph, 'upload');

      this.graphRefs.areDefined = true;
    }

    this.graphRefs.download.area.attr('d', downloadAreaShape);
    this.graphRefs.download.rateLine.attr('d', downloadLinePath);
    this.graphRefs.upload.area.attr('d', uploadAreaShape);
    this.graphRefs.upload.rateLine.attr('d', uploadLinePath);
  }

  setInspectorCoordinates(slug, hoverPoint) {
    const {
      graphRefs: {[slug]: {inspectPoint}},
      props: {historicalData},
      xScale,
      yScale,
    } = this;

    const upperSpeed = historicalData[slug][Math.ceil(hoverPoint)];
    const lowerSpeed = historicalData[slug][Math.floor(hoverPoint)];

    const delta = upperSpeed - lowerSpeed;
    const speedAtHoverPoint = lowerSpeed + (delta * (hoverPoint % 1));

    const coordinates = {x: xScale(hoverPoint), y: yScale(speedAtHoverPoint)};

    inspectPoint.attr(
      'transform', 'translate(' + coordinates.x + ',' + coordinates.y + ')'
    );

    return speedAtHoverPoint;
  }

  renderPrecisePointInspectors() {
    const {
      lastMouseX,
      props: {historicalData, onHover},
      xScale
    } = this;

    const hoverPoint = xScale.invert(lastMouseX);
    const uploadSpeed = this.setInspectorCoordinates('upload', hoverPoint);
    const downloadSpeed = this.setInspectorCoordinates('download', hoverPoint);
    const nearestTimestamp = historicalData.timestamps[Math.round(hoverPoint)];

    if (onHover) {
      onHover({
        uploadSpeed,
        downloadSpeed,
        nearestTimestamp
      });
    }
  }

  getGradient(slug) {
    return (
      <linearGradient id={`graph__gradient--${slug}`} x1="0%" y1="0%"
        x2="0%" y2="100%">
        <stop className={`graph__gradient--top graph__gradient--top--${slug}`} offset="0%"/>
        <stop className={`graph__gradient--bottom graph__gradient--bottom--${slug}`} offset="100%"/>
      </linearGradient>
    );
  }

  render() {
    return (
      <svg className="graph" id={this.props.id}
        ref={ref => this.graphRefs.graph = ref}>
        <defs>
          {this.getGradient('upload')}
          {this.getGradient('download')}
        </defs>
      </svg>
    );
  }
}

LineChart.defaultProps = {
  width: 240
};

LineChart.propTypes = {
  width: React.PropTypes.number
};

export default LineChart;
