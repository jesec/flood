import {area, curveMonotoneX, line} from 'd3-shape';
import {FC, MutableRefObject, useRef, useState} from 'react';
import {max} from 'd3-array';
import {observer} from 'mobx-react';
import {scaleLinear} from 'd3-scale';

import type {TransferDirection, TransferHistory} from '@shared/types/TransferData';

import TransferDataStore, {TRANSFER_DIRECTIONS} from '../../stores/TransferDataStore';

const TransferRateGraphGradient: FC<{direction: TransferDirection}> = ({direction}: {direction: TransferDirection}) => (
  <linearGradient id={`graph__gradient--${direction}`} x1="0%" y1="0%" x2="0%" y2="100%">
    <stop className={`graph__gradient--top graph__gradient--top--${direction}`} offset="0%" />
    <stop className={`graph__gradient--bottom graph__gradient--bottom--${direction}`} offset="100%" />
  </linearGradient>
);

export interface TransferRateGraphEventHandlers {
  handleMouseMove: (mouseX: number) => void;
  handleMouseOut: () => void;
  handleMouseOver: () => void;
}

export interface TransferRateGraphInspectorPoint {
  upload: number;
  download: number;
  timestamp: number;
}

interface TransferRateGraphProps {
  id: string;
  height: number;
  width: number;
  handlerRefs: MutableRefObject<TransferRateGraphEventHandlers | null>;
  onHover: (inspectorPoint: TransferRateGraphInspectorPoint) => void;
  onMouseOut: () => void;
}

const getSpeedAtHoverPoint = (history: TransferHistory, direction: TransferDirection, hoverPoint: number) => {
  const upperSpeed = history[direction][Math.ceil(hoverPoint)];
  const lowerSpeed = history[direction][Math.floor(hoverPoint)];
  return lowerSpeed + (upperSpeed - lowerSpeed) * (hoverPoint % 1);
};

const TransferRateGraph: FC<TransferRateGraphProps> = observer(
  ({id, height, width, handlerRefs, onHover, onMouseOut}: TransferRateGraphProps) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const hoverPoint = useRef<number>(0);
    const inspectorPoint = useRef<TransferRateGraphInspectorPoint>({download: 0, upload: 0, timestamp: 0});

    const historicalData = TransferDataStore.transferRates;

    const xScale = scaleLinear()
      .domain([0, historicalData.download.length - 1])
      .range([0, width]);

    const yScale = scaleLinear()
      .domain([
        0,
        max(historicalData.download, (dataPoint, index) => Math.max(dataPoint, historicalData.upload[index])) as number,
      ])
      .range([height - 10, 10]);

    // eslint-disable-next-line no-param-reassign
    handlerRefs.current = {
      handleMouseMove: (mouseX: number) => {
        hoverPoint.current = xScale.invert(mouseX);
        onHover(inspectorPoint.current);
      },
      handleMouseOut: () => {
        setIsHovered(false);
        onMouseOut();
      },
      handleMouseOver: () => {
        setIsHovered(true);
      },
    };

    if (isHovered) {
      inspectorPoint.current = {
        download: getSpeedAtHoverPoint(historicalData, 'download', hoverPoint.current),
        upload: getSpeedAtHoverPoint(historicalData, 'upload', hoverPoint.current),
        timestamp: historicalData.timestamps[Math.round(hoverPoint.current)],
      };
    }

    const interpolation = curveMonotoneX;

    return (
      <svg className="graph" id={id} height="100%" width="100%">
        <defs>
          <TransferRateGraphGradient direction="upload" />
          <TransferRateGraphGradient direction="download" />
        </defs>
        {TRANSFER_DIRECTIONS.map((direction) => [
          <path
            className="graph__area"
            key={`area-${direction}`}
            fill={`url('#graph__gradient--${direction}')`}
            d={
              area<number>()
                .x((_dataPoint, index) => xScale(index) || 0)
                .y0(height)
                .y1((dataPoint) => yScale(dataPoint) || 0)
                .curve(interpolation)(historicalData[direction]) as string
            }
          />,
          <path
            className={`graph__line graph__line--${direction}`}
            key={`line-${direction}`}
            d={
              line<number>()
                .x((_dataPoint, index) => xScale(index) || 0)
                .y((dataPoint) => yScale(dataPoint) || 0)
                .curve(interpolation)(historicalData[direction]) as string
            }
          />,
          <circle
            className={`graph__circle graph__circle--${direction}`}
            key={`point-${direction}`}
            r={2.5}
            style={{opacity: isHovered ? 1 : 0}}
            transform={`translate(${xScale(hoverPoint.current)},${yScale(inspectorPoint.current[direction])})`}
          />,
        ])}
      </svg>
    );
  },
);

export default TransferRateGraph;
