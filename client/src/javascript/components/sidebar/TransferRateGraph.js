import d3 from 'd3';
import PropTypes from 'prop-types';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import TransferDataStore from '../../stores/TransferDataStore';

const METHODS_TO_BIND = [
  'appendGraphCircles',
  'appendEmptyGraphShapes',
  'handleTransferHistoryChange',
  'handleMouseOut',
  'handleMouseOver',
  'handleMouseMove',
  'renderGraphData',
];

class TransferRateGraph extends React.Component {
  static propTypes = {
    width: PropTypes.number,
  };

  static defaultProps = {
    width: 240,
  };

  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.graphRefs = {areDefined: false, isHovered: false};
    this.isInitialRender = true;
    this.lastMouseX = null;
    this.shouldUpdateGraph = true;
    this.xScale = {};
    this.yScale = {};
  }

  componentDidMount() {
    TransferDataStore.listen(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS, this.handleTransferHistoryChange);

    this.renderGraphData();
  }

  componentDidUpdate() {
    this.renderGraphData();
  }

  componentWillUnmount() {
    TransferDataStore.unlisten(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS, this.handleTransferHistoryChange);
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
    this.graphRefs[slug].rateLine = graph.append('path').attr('class', `graph__line graph__line--${slug}`);
  }

  getGradient(slug) {
    return (
      <linearGradient id={`graph__gradient--${slug}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop className={`graph__gradient--top graph__gradient--top--${slug}`} offset="0%" />
        <stop className={`graph__gradient--bottom graph__gradient--bottom--${slug}`} offset="100%" />
      </linearGradient>
    );
  }

  handleTransferHistoryChange() {
    this.updateGraph();
  }

  handleMouseMove(mouseX) {
    this.lastMouseX = mouseX;
    this.renderPrecisePointInspectors();
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

  handleMouseOver() {
    this.graphRefs.isHovered = true;
    this.graphRefs.upload.inspectPoint.style('opacity', 1);
    this.graphRefs.download.inspectPoint.style('opacity', 1);
  }

  renderGraphData() {
    const historicalData = TransferDataStore.getTransferRates();
    const {height, id, width} = this.props;
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
        }),
      ])
      .range([height - margin.top, margin.bottom]);

    const lineFunc = interpolation => {
      return d3.svg
        .line()
        .x((dataPoint, index) => this.xScale(index))
        .y(dataPoint => this.yScale(dataPoint))
        .interpolate(interpolation);
    };

    const areaFunc = interpolation => {
      return d3.svg
        .area()
        .x((dataPoint, index) => this.xScale(index))
        .y0(height)
        .y1(dataPoint => this.yScale(dataPoint))
        .interpolate(interpolation);
    };

    const interpolation = 'monotone';
    const downloadLinePath = lineFunc(interpolation)(historicalData.download);
    const downloadAreaShape = areaFunc(interpolation)(historicalData.download);
    const uploadLinePath = lineFunc(interpolation)(historicalData.upload);
    const uploadAreaShape = areaFunc(interpolation)(historicalData.upload);

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

  renderPrecisePointInspectors() {
    const {
      lastMouseX,
      props: {onHover},
      xScale,
    } = this;

    const historicalData = TransferDataStore.getTransferRates();
    const hoverPoint = xScale.invert(lastMouseX);
    const uploadSpeed = this.setInspectorCoordinates('upload', hoverPoint);
    const downloadSpeed = this.setInspectorCoordinates('download', hoverPoint);
    const nearestTimestamp = historicalData.timestamps[Math.round(hoverPoint)];

    if (onHover) {
      onHover({
        uploadSpeed,
        downloadSpeed,
        nearestTimestamp,
      });
    }
  }

  setInspectorCoordinates(slug, hoverPoint) {
    const {
      graphRefs: {
        [slug]: {inspectPoint},
      },
      xScale,
      yScale,
    } = this;

    const historicalData = TransferDataStore.getTransferRates();
    const upperSpeed = historicalData[slug][Math.ceil(hoverPoint)];
    const lowerSpeed = historicalData[slug][Math.floor(hoverPoint)];

    const delta = upperSpeed - lowerSpeed;
    const speedAtHoverPoint = lowerSpeed + delta * (hoverPoint % 1);

    const coordinates = {x: xScale(hoverPoint), y: yScale(speedAtHoverPoint)};

    inspectPoint.attr('transform', 'translate(' + coordinates.x + ',' + coordinates.y + ')');

    return speedAtHoverPoint;
  }

  updateGraph() {
    this.renderGraphData();

    if (this.graphRefs.isHovered) {
      this.renderPrecisePointInspectors();
    }
  }

  render() {
    return (
      <svg className="graph" id={this.props.id} ref={ref => (this.graphRefs.graph = ref)}>
        <defs>
          {this.getGradient('upload')}
          {this.getGradient('download')}
        </defs>
      </svg>
    );
  }
}

export default TransferRateGraph;
