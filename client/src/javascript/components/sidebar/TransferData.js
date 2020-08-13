import React from 'react';
import Measure from 'react-measure';

import ClientStatusStore from '../../stores/ClientStatusStore';
import connectStores from '../../util/connectStores';
import EventTypes from '../../constants/EventTypes';
import TransferRateDetails from './TransferRateDetails';
import TransferRateGraph from './TransferRateGraph';

class TransferData extends React.Component {
  static defaultProps = {
    historyLength: 1,
  };

  constructor(props) {
    super(props);
    this.state = {
      graphInspectorPoint: null,
      sidebarWidth: 0,
    };
  }

  handleGraphHover = (graphInspectorPoint) => {
    this.setState({graphInspectorPoint});
  };

  handleGraphMouseOut = () => {
    this.setState({graphInspectorPoint: null});
  };

  handleMouseMove = (event) => {
    if (this.props.isClientConnected && event && event.nativeEvent && event.nativeEvent.clientX != null) {
      this.rateGraphRef.handleMouseMove(event.nativeEvent.clientX);
    }
  };

  handleMouseOut = () => {
    if (this.props.isClientConnected) {
      this.rateGraphRef.handleMouseOut();
    }
  };

  handleMouseOver = () => {
    if (this.props.isClientConnected) {
      this.rateGraphRef.handleMouseOver();
    }
  };

  renderTransferRateGraph() {
    if (!this.props.isClientConnected) return null;

    return (
      <TransferRateGraph
        height={150}
        id="transfer-rate-graph"
        onMouseOut={this.handleGraphMouseOut}
        onHover={this.handleGraphHover}
        ref={(ref) => {
          this.rateGraphRef = ref;
        }}
        width={this.state.sidebarWidth}
      />
    );
  }

  render() {
    return (
      <Measure
        offset
        onResize={(contentRect) => {
          this.setState({sidebarWidth: contentRect.offset.width});
        }}>
        {({measureRef}) => (
          <div ref={measureRef} className="client-stats__wrapper sidebar__item">
            <div
              className="client-stats"
              onMouseMove={this.handleMouseMove}
              onMouseOut={this.handleMouseOut}
              onMouseOver={this.handleMouseOver}>
              <TransferRateDetails inspectorPoint={this.state.graphInspectorPoint} />
              {this.renderTransferRateGraph()}
            </div>
          </div>
        )}
      </Measure>
    );
  }
}

const ConnectedTransferData = connectStores(TransferData, () => {
  return [
    {
      store: ClientStatusStore,
      event: EventTypes.CLIENT_CONNECTION_STATUS_CHANGE,
      getValue: ({store}) => {
        return {
          isClientConnected: store.getIsConnected(),
        };
      },
    },
  ];
});

export default ConnectedTransferData;
