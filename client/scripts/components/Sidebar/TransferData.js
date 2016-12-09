import _ from 'lodash';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import {FormattedMessage} from 'react-intl';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';

import Download from '../Icons/Download';
import Duration from '../General/Duration';
import EventTypes from '../../constants/EventTypes';
import LineChart from '../General/LineChart';
import LoadingIndicator from '../General/LoadingIndicator';
import Size from '../General/Size';
import TransferDataStore from '../../stores/TransferDataStore';
import TransferRateDetails from './TransferRateDetails';
import TransferRateGraph from './TransferRateGraph';
import UIStore from '../../stores/UIStore';
import Upload from '../Icons/Upload';

const METHODS_TO_BIND = [
  'handleGraphHover',
  'handleGraphMouseLeave',
  'handleMouseMove',
  'handleMouseOut',
  'handleMouseOver',
  'onTransferDataRequestError',
  'onTransferDataRequestSuccess',
  'onTransferHistoryRequestSuccess'
];

class TransferData extends React.Component {
  constructor() {
    super();

    this.state = {
      graphInspectorPoint: null,
      sidebarWidth: 0,
      transferHistoryRequestSuccess: false,
      transferDataRequestError: false,
      transferDataRequestSuccess: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    UIStore.registerDependency([
      {
        id: 'transfer-data',
        message: (
          <FormattedMessage id="dependency.loading.transfer.rate.details"
            defaultMessage="Data Transfer Rate Details" />
        )
      },
      {
        id: 'transfer-history',
        message: (
          <FormattedMessage id="dependency.loading.transfer.history"
            defaultMessage="Data Transfer History" />
        )
      }
    ]);
  }

  componentDidMount() {
    this.setState({
      sidebarWidth: ReactDOM.findDOMNode(this).offsetWidth
    });

    TransferDataStore.listen(EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess);
    TransferDataStore.listen(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS,
      this.onTransferHistoryRequestSuccess);
    TransferDataStore.fetchTransferData();
  }

  componentWillUnmount() {
    TransferDataStore.unlisten(EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess);
    TransferDataStore.unlisten(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS,
      this.onTransferHistoryRequestSuccess);
  }

  handleGraphHover(graphInspectorPoint) {
    this.setState({graphInspectorPoint});
  }

  handleGraphMouseLeave() {
    this.setState({graphInspectorPoint: null});
  }

  handleMouseMove(event) {
    if (event && event.nativeEvent && event.nativeEvent.clientX != null) {
      this.rateGraphRef.handleMouseMove(event.nativeEvent.clientX);
    }
  }

  handleMouseOut() {
    this.rateGraphRef.handleMouseOut();
  }

  handleMouseOver() {
    this.rateGraphRef.handleMouseOver();
  }

  isLoading() {
    if (!this.state.transferHistoryRequestSuccess ||
      !this.state.transferDataRequestSuccess) {
      return true;
    }

    return false;
  }

  onTransferDataRequestError() {
    this.setState({
      transferDataRequestError: true,
      transferDataRequestSuccess: false
    });
  }

  onTransferDataRequestSuccess() {
    this.setState({
      transferDataRequestError: false,
      transferDataRequestSuccess: true
    });

    UIStore.satisfyDependency('transfer-data');
  }

  onTransferHistoryRequestSuccess() {
    if (!this.state.transferHistoryRequestSuccess) {
      this.setState({
        transferHistoryRequestSuccess: true
      });
    }

    UIStore.satisfyDependency('transfer-history');
  }

  render() {
    let content = null;

    if (!this.isLoading()) {
      const throttles = TransferDataStore.getThrottles({latest: true});
      const transferRate = TransferDataStore.getTransferRate();
      const transferRates = TransferDataStore.getTransferRates();
      const transferTotals = TransferDataStore.getTransferTotals();

      content = (
        <div className="client-stats"
          onMouseMove={this.handleMouseMove}
          onMouseOut={this.handleMouseOut}
          onMouseOver={this.handleMouseOver}>
          <TransferRateDetails
            inspectorPoint={this.state.graphInspectorPoint}
            throttles={throttles}
            transferRate={transferRate}
            transferTotals={transferTotals} />
          <TransferRateGraph
            height={150}
            historicalData={transferRates}
            id="transfer-rate-graph"
            onGraphMouseLeave={this.handleGraphMouseLeave}
            onHover={this.handleGraphHover}
            ref={ref => this.rateGraphRef = ref}
            width={this.state.sidebarWidth} />
        </div>
      );
    } else {
      content = <LoadingIndicator inverse={true} />;
    }

    return (
      <div className="client-stats__wrapper sidebar__item">
        {content}
      </div>
    );
  }
}

TransferData.defaultProps = {
  historyLength: 1
};

export default TransferData;
