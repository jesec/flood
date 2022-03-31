import {FC, useState, useRef} from 'react';
import Measure from 'react-measure';
import {observer} from 'mobx-react';

import ClientStatusStore from '../../stores/ClientStatusStore';
import TransferRateDetails from './TransferRateDetails';
import TransferRateGraph from './TransferRateGraph';

import type {TransferRateGraphEventHandlers, TransferRateGraphInspectorPoint} from './TransferRateGraph';

const TransferData: FC = observer(() => {
  const [graphInspectorPoint, setGraphInspectorPoint] = useState<TransferRateGraphInspectorPoint | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(250);
  const rateGraphHandlerRefs = useRef<TransferRateGraphEventHandlers>(null);

  return (
    <Measure
      offset
      onResize={(contentRect) => {
        if (contentRect.offset?.width) {
          setSidebarWidth(contentRect.offset.width);
        }
      }}
    >
      {({measureRef}) => (
        <div ref={measureRef} className="client-stats__wrapper sidebar__item">
          <div
            className="client-stats"
            onMouseMove={(event) => {
              if (event?.nativeEvent?.clientX != null) {
                rateGraphHandlerRefs.current?.handleMouseMove(event.nativeEvent.clientX);
              }
            }}
            onMouseOver={() => rateGraphHandlerRefs.current?.handleMouseOver()}
            onMouseOut={() => rateGraphHandlerRefs.current?.handleMouseOut()}
            onFocus={() => rateGraphHandlerRefs.current?.handleMouseOver()}
            onBlur={() => rateGraphHandlerRefs.current?.handleMouseOut()}
          >
            <TransferRateDetails inspectorPoint={graphInspectorPoint} />
            {ClientStatusStore.isConnected && (
              <TransferRateGraph
                height={150}
                id="transfer-rate-graph"
                onMouseOut={() => {
                  setGraphInspectorPoint(null);
                }}
                onHover={(inspectorPoint) => {
                  setGraphInspectorPoint(inspectorPoint);
                }}
                handlerRefs={rateGraphHandlerRefs}
                width={sidebarWidth}
              />
            )}
          </div>
        </div>
      )}
    </Measure>
  );
});

export default TransferData;
