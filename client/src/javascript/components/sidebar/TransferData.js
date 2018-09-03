import {FormattedMessage} from 'react-intl';
import React from 'react';
import ReactDOM from 'react-dom';

import ClientStatusStore from '../../stores/ClientStatusStore';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicator from '../general/LoadingIndicator';
import TransferDataStore from '../../stores/TransferDataStore';
import TransferRateDetails from './TransferRateDetails';
import TransferRateGraph from './TransferRateGraph';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'handleGraphHover',
  'handleGraphMouseOut',
  'handleMouseMove',
  'handleMouseOut',
  'handleMouseOver',
  'onTransferDataRequestError',
  'onTransferSummaryChange',
  'onTransferHistoryRequestSuccess',
];

class TransferData extends React.Component {
  constructor() {
    super();

    this.state = {
      graphInspectorPoint: null,
      isClientConnected: false,
      sidebarWidth: 0,
      transferHistoryRequestSuccess: false,
      transferDataRequestError: false,
      transferDataRequestSuccess: false,
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    UIStore.registerDependency([
      {
        id: 'transfer-data',
        message: (
          <FormattedMessage id="dependency.loading.transfer.rate.details" defaultMessage="Data Transfer Rate Details" />
        ),
      },
      {
        id: 'transfer-history',
        message: <FormattedMessage id="dependency.loading.transfer.history" defaultMessage="Data Transfer History" />,
      },
    ]);
  }

  componentDidMount() {
    this.setState({
      sidebarWidth: ReactDOM.findDOMNode(this).offsetWidth,
    });

    ClientStatusStore.listen(EventTypes.CLIENT_CONNECTION_STATUS_CHANGE, this.handleClientStatusChange);
    TransferDataStore.listen(EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE, this.onTransferSummaryChange);
    TransferDataStore.listen(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS, this.onTransferHistoryRequestSuccess);
  }

  componentWillUnmount() {
    ClientStatusStore.unlisten(EventTypes.CLIENT_CONNECTION_STATUS_CHANGE, this.handleClientStatusChange);
    TransferDataStore.unlisten(EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE, this.onTransferSummaryChange);
    TransferDataStore.unlisten(
      EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS,
      this.onTransferHistoryRequestSuccess
    );
  }

  handleClientStatusChange = () => {
    this.setState({
      isClientConnected: ClientStatusStore.getIsConnected(),
    });
  };

  handleGraphHover(graphInspectorPoint) {
    this.setState({graphInspectorPoint});
  }

  handleGraphMouseOut() {
    this.setState({graphInspectorPoint: null});
  }

  handleMouseMove(event) {
    if (this.state.isClientConnected && event && event.nativeEvent && event.nativeEvent.clientX != null) {
      this.rateGraphRef.handleMouseMove(event.nativeEvent.clientX);
    }
  }

  handleMouseOut() {
    this.state.isClientConnected && this.rateGraphRef.handleMouseOut();
  }

  handleMouseOver() {
    this.state.isClientConnected && this.rateGraphRef.handleMouseOver();
  }

  isLoading() {
    if (!this.state.transferHistoryRequestSuccess || !this.state.transferDataRequestSuccess) {
      return true;
    }

    return false;
  }

  onTransferDataRequestError() {
    this.setState({
      transferDataRequestError: true,
      transferDataRequestSuccess: false,
    });
  }

  onTransferSummaryChange() {
    this.setState({
      transferDataRequestError: false,
      transferDataRequestSuccess: true,
    });

    UIStore.satisfyDependency('transfer-data');
  }

  onTransferHistoryRequestSuccess() {
    if (!this.state.transferHistoryRequestSuccess) {
      this.setState({
        transferHistoryRequestSuccess: true,
      });
    }

    UIStore.satisfyDependency('transfer-history');
  }

  renderTransferRateGraph() {
    if (!this.state.isClientConnected) return null;

    return (
      <TransferRateGraph
        height={150}
        id="transfer-rate-graph"
        onMouseOut={this.handleGraphMouseOut}
        onHover={this.handleGraphHover}
        ref={ref => (this.rateGraphRef = ref)}
        width={this.state.sidebarWidth}
      />
    );
  }

  render() {
    let content = null;

    if (!this.isLoading()) {
      const transferSummary = TransferDataStore.getTransferSummary();

      content = (
        <div
          className="client-stats"
          onMouseMove={this.handleMouseMove}
          onMouseOut={this.handleMouseOut}
          onMouseOver={this.handleMouseOver}>
          <TransferRateDetails
            isClientConnected={this.state.isClientConnected}
            inspectorPoint={this.state.graphInspectorPoint}
            transferSummary={transferSummary}
          />
          {this.renderTransferRateGraph()}
        </div>
      );
    } else {
      content = <LoadingIndicator inverse={true} />;
    }

    return <div className="client-stats__wrapper sidebar__item">{content}</div>;
  }
}

TransferData.defaultProps = {
  historyLength: 1,
};

export default TransferData;
