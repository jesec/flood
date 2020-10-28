import {observer} from 'mobx-react';
import Measure from 'react-measure';
import * as React from 'react';

import ClientStatusStore from '../../stores/ClientStatusStore';
import TransferRateDetails from './TransferRateDetails';
import TransferRateGraph from './TransferRateGraph';

import type {TransferRateGraphInspectorPoint} from './TransferRateGraph';

interface TransferDataStates {
  graphInspectorPoint: TransferRateGraphInspectorPoint | null;
  sidebarWidth: number;
}

@observer
class TransferData extends React.Component<unknown, TransferDataStates> {
  rateGraphRef: TransferRateGraph | null = null;

  constructor(props: unknown) {
    super(props);

    this.state = {
      graphInspectorPoint: null,
      sidebarWidth: 0,
    };
  }

  handleGraphHover = (graphInspectorPoint: TransferDataStates['graphInspectorPoint']) => {
    this.setState({graphInspectorPoint});
  };

  handleGraphMouseOut = () => {
    this.setState({graphInspectorPoint: null});
  };

  handleMouseMove = (event: React.MouseEvent) => {
    if (
      this.rateGraphRef != null &&
      ClientStatusStore.isConnected &&
      event &&
      event.nativeEvent &&
      event.nativeEvent.clientX != null
    ) {
      this.rateGraphRef.handleMouseMove(event.nativeEvent.clientX);
    }
  };

  handleMouseOut = () => {
    if (this.rateGraphRef != null && ClientStatusStore.isConnected) {
      this.rateGraphRef.handleMouseOut();
    }
  };

  handleMouseOver = () => {
    if (this.rateGraphRef != null && ClientStatusStore.isConnected) {
      this.rateGraphRef.handleMouseOver();
    }
  };

  renderTransferRateGraph() {
    const {sidebarWidth} = this.state;

    if (!ClientStatusStore.isConnected) return null;

    return (
      <TransferRateGraph
        height={150}
        id="transfer-rate-graph"
        onMouseOut={this.handleGraphMouseOut}
        onHover={this.handleGraphHover}
        ref={(ref) => {
          this.rateGraphRef = ref;
        }}
        width={sidebarWidth}
      />
    );
  }

  render() {
    const {graphInspectorPoint} = this.state;

    return (
      <Measure
        offset
        onResize={(contentRect) => {
          if (contentRect.offset != null) {
            this.setState({sidebarWidth: contentRect.offset.width});
          }
        }}>
        {({measureRef}) => (
          <div ref={measureRef} className="client-stats__wrapper sidebar__item">
            <div
              className="client-stats"
              onMouseMove={this.handleMouseMove}
              onMouseOut={this.handleMouseOut}
              onMouseOver={this.handleMouseOver}>
              <TransferRateDetails inspectorPoint={graphInspectorPoint} />
              {this.renderTransferRateGraph()}
            </div>
          </div>
        )}
      </Measure>
    );
  }
}

export default TransferData;
