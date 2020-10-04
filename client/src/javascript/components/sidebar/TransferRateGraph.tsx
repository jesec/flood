import {area, curveMonotoneX, line} from 'd3-shape';
import {max} from 'd3-array';
import {ScaleLinear, scaleLinear} from 'd3-scale';
import {Selection, select} from 'd3-selection';
import React from 'react';

import type {TransferDirection} from '@shared/types/TransferData';

import TransferDataStore, {TRANSFER_DIRECTIONS} from '../../stores/TransferDataStore';

export interface TransferRateGraphInspectorPoint {
  uploadSpeed: number;
  downloadSpeed: number;
  nearestTimestamp: number;
}

interface TransferRateGraphProps {
  id: string;
  height: number;
  width: number;
  onHover: (inspectorPoint: TransferRateGraphInspectorPoint) => void;
  onMouseOut: () => void;
}

const METHODS_TO_BIND = [
  'handleTransferHistoryChange',
  'handleMouseOut',
  'handleMouseOver',
  'handleMouseMove',
] as const;

class TransferRateGraph extends React.Component<TransferRateGraphProps> {
  private static getGradient(slug: TransferDirection): React.ReactNode {
    return (
      <linearGradient id={`graph__gradient--${slug}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop className={`graph__gradient--top graph__gradient--top--${slug}`} offset="0%" />
        <stop className={`graph__gradient--bottom graph__gradient--bottom--${slug}`} offset="100%" />
      </linearGradient>
    );
  }

  lastMouseX?: number;
  xScale?: ScaleLinear<number, number>;
  yScale?: ScaleLinear<number, number>;
  graphRefs: {
    graph: SVGSVGElement | null;
    areDefined: boolean;
    isHovered: boolean;
  } & Record<
    TransferDirection,
    {
      graphArea?: Selection<SVGPathElement, unknown, HTMLElement, unknown>;
      inspectPoint?: Selection<SVGCircleElement, unknown, HTMLElement, unknown>;
      rateLine?: Selection<SVGPathElement, unknown, HTMLElement, unknown>;
    }
  > = {graph: null, areDefined: false, isHovered: false, download: {}, upload: {}};

  static defaultProps = {
    width: 240,
  };

  constructor(props: TransferRateGraphProps) {
    super(props);

    METHODS_TO_BIND.forEach(<T extends typeof METHODS_TO_BIND[number]>(methodName: T) => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  componentDidMount(): void {
    TransferDataStore.listen('CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS', this.handleTransferHistoryChange);

    this.renderGraphData();
  }

  componentDidUpdate(): void {
    this.renderGraphData();
  }

  componentWillUnmount(): void {
    TransferDataStore.unlisten('CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS', this.handleTransferHistoryChange);
  }

  handleTransferHistoryChange(): void {
    this.updateGraph();
  }

  handleMouseMove(mouseX: number): void {
    this.lastMouseX = mouseX;
    this.renderPrecisePointInspectors();
  }

  handleMouseOut(): void {
    const {graphRefs, props} = this;

    graphRefs.isHovered = false;

    TRANSFER_DIRECTIONS.forEach(<T extends TransferDirection>(direction: T) => {
      const {inspectPoint} = graphRefs[direction];
      if (inspectPoint != null) {
        graphRefs[direction].inspectPoint = inspectPoint.style('opacity', 0);
      }
    });

    if (props.onMouseOut) {
      props.onMouseOut();
    }
  }

  handleMouseOver(): void {
    this.graphRefs.isHovered = true;

    TRANSFER_DIRECTIONS.forEach(<T extends TransferDirection>(direction: T) => {
      const {inspectPoint} = this.graphRefs[direction];
      if (inspectPoint != null) {
        this.graphRefs[direction].inspectPoint = inspectPoint.style('opacity', 1);
      }
    });
  }

  private initGraph(): void {
    if (this.graphRefs.areDefined === true) {
      return;
    }

    const graph = select(`#${this.props.id}`);
    TRANSFER_DIRECTIONS.forEach(<T extends TransferDirection>(direction: T) => {
      // appendEmptyGraphShapes
      this.graphRefs[direction].graphArea = graph
        .append('path')
        .attr('class', 'graph__area')
        .attr('fill', `url('#graph__gradient--${direction}')`);

      // appendEmptyGraphLines
      this.graphRefs[direction].rateLine = graph.append('path').attr('class', `graph__line graph__line--${direction}`);

      // appendGraphCircles
      this.graphRefs[direction].inspectPoint = graph
        .append('circle')
        .attr('class', `graph__circle graph__circle--${direction}`)
        .attr('r', 2.5);
    });

    this.graphRefs.areDefined = true;
  }

  private setInspectorCoordinates(slug: TransferDirection, hoverPoint: number): number {
    const {
      graphRefs: {
        [slug]: {inspectPoint},
      },
      xScale,
      yScale,
    } = this;

    if (xScale == null || yScale == null || inspectPoint == null) {
      return 0;
    }

    const historicalData = TransferDataStore.getTransferRates();
    const upperSpeed = historicalData[slug][Math.ceil(hoverPoint)];
    const lowerSpeed = historicalData[slug][Math.floor(hoverPoint)];

    const delta = upperSpeed - lowerSpeed;
    const speedAtHoverPoint = lowerSpeed + delta * (hoverPoint % 1);

    const coordinates = {x: xScale(hoverPoint), y: yScale(speedAtHoverPoint)};

    inspectPoint.attr('transform', `translate(${coordinates.x},${coordinates.y})`);

    return speedAtHoverPoint;
  }

  private updateGraph() {
    this.renderGraphData();

    if (this.graphRefs.isHovered) {
      this.renderPrecisePointInspectors();
    }
  }

  private renderGraphData(): void {
    const historicalData = TransferDataStore.getTransferRates();
    const {height, width} = this.props;
    const margin = {bottom: 10, top: 10};

    this.xScale = scaleLinear()
      .domain([0, historicalData.download.length - 1])
      .range([0, width]);

    this.yScale = scaleLinear()
      .domain([
        0,
        max(historicalData.download, (dataPoint, index) => Math.max(dataPoint, historicalData.upload[index])) as number,
      ])
      .range([height - margin.top, margin.bottom]);

    this.initGraph();

    const interpolation = curveMonotoneX;
    TRANSFER_DIRECTIONS.forEach(<T extends TransferDirection>(direction: T) => {
      const {xScale, yScale} = this;
      const {graphArea, rateLine} = this.graphRefs[direction];

      if (rateLine == null || graphArea == null || xScale == null || yScale == null) {
        return;
      }

      this.graphRefs[direction].rateLine = rateLine.attr(
        'd',
        line<number>()
          .x((_dataPoint, index) => xScale(index))
          .y((dataPoint) => yScale(dataPoint))
          .curve(interpolation)(historicalData[direction]) as string,
      );

      this.graphRefs[direction].graphArea = graphArea.attr(
        'd',
        area<number>()
          .x((dataPoint, index) => xScale(index))
          .y0(height)
          .y1((dataPoint) => yScale(dataPoint))
          .curve(interpolation)(historicalData[direction]) as string,
      );
    });
  }

  private renderPrecisePointInspectors(): void {
    const {
      lastMouseX,
      props: {onHover},
      xScale,
    } = this;

    if (xScale == null || lastMouseX == null) {
      return;
    }

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

  render() {
    return (
      <svg
        className="graph"
        id={this.props.id}
        ref={(ref) => {
          this.graphRefs.graph = ref;
        }}>
        <defs>
          {TransferRateGraph.getGradient('upload')}
          {TransferRateGraph.getGradient('download')}
        </defs>
      </svg>
    );
  }
}

export default TransferRateGraph;
