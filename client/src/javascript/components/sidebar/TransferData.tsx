import {FC, useState, useRef, useEffect} from 'react';
import Measure from 'react-measure';
import {observer} from 'mobx-react';
import {reaction} from 'mobx';

import ClientStatusStore from '../../stores/ClientStatusStore';
import TransferDataStore from '../../stores/TransferDataStore';
import TransferRateDetails from './TransferRateDetails';
import TransferRateGraph from './TransferRateGraph';

import type {TransferRateGraphInspectorPoint} from './TransferRateGraph';

const TransferData: FC = observer(() => {
  const [graphInspectorPoint, setGraphInspectorPoint] = useState<TransferRateGraphInspectorPoint | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(0);
  const rateGraphRef = useRef<TransferRateGraph>(null);

  useEffect(() => {
    const dispose = reaction(
      () => TransferDataStore.transferRates,
      () => {
        if (rateGraphRef.current != null) {
          rateGraphRef.current.handleTransferHistoryChange();
        }
      },
    );

    return dispose;
  }, []);

  return (
    <Measure
      offset
      onResize={(contentRect) => {
        if (contentRect.offset != null) {
          setSidebarWidth(contentRect.offset.width);
        }
      }}>
      {({measureRef}) => (
        <div ref={measureRef} className="client-stats__wrapper sidebar__item">
          <div
            className="client-stats"
            onMouseMove={(event) => {
              if (rateGraphRef.current != null && event?.nativeEvent?.clientX != null) {
                rateGraphRef.current.handleMouseMove(event.nativeEvent.clientX);
              }
            }}
            onMouseOut={() => {
              if (rateGraphRef.current != null) {
                rateGraphRef.current.handleMouseOut();
              }
            }}
            onMouseOver={() => {
              if (rateGraphRef.current != null) {
                rateGraphRef.current.handleMouseOver();
              }
            }}>
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
                ref={rateGraphRef}
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
