import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import CSSTransitionGroup from 'react-addons-css-transition-group';
import Download from '../icons/Download';
import EventTypes from '../../constants/EventTypes';
import format from '../../util/formatData';
import LineChart from '../ui/LineChart';
import LoadingIndicator from '../ui/LoadingIndicator';
import TransferDataStore from '../../stores/TransferDataStore';
import UIStore from '../../stores/UIStore';
import Upload from '../icons/Upload';

const METHODS_TO_BIND = [
  'onTransferDataRequestError',
  'onTransferDataRequestSuccess',
  'onTransferHistoryRequestSuccess'
];

class ClientStats extends React.Component {
  constructor() {
    super();

    this.state = {
      sidebarWidth: 0,
      transferHistoryRequestSuccess: false,
      transferDataRequestError: false,
      transferDataRequestSuccess: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    UIStore.registerDependency(['transfer-data', 'transfer-history']);
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
    TransferDataStore.unlisten(
      EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess
    );
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

    if (!UIStore.hasSatisfiedDependencies()) {
      UIStore.satisfyDependency('transfer-data');
    }
  }

  onTransferHistoryRequestSuccess() {
    if (!this.state.transferHistoryRequestSuccess) {
      this.setState({
        transferHistoryRequestSuccess: true
      });
    }

    if (!UIStore.hasSatisfiedDependencies()) {
      UIStore.satisfyDependency('transfer-history');
    }
  }

  render() {
    let content = <LoadingIndicator inverse={true} />

    if (!this.isLoading()) {
      let throttles = TransferDataStore.getThrottles();
      let transferRate = TransferDataStore.getTransferRate();
      let transferRates = TransferDataStore.getTransferRates();
      let transferTotals = TransferDataStore.getTransferTotals();

      let downloadRate = format.data(transferRate.download, '/s');
      let downloadTotal = format.data(transferTotals.download);
      let uploadRate = format.data(transferRate.upload, '/s');
      let uploadTotal = format.data(transferTotals.upload);

      content = (
        <div key="loaded">
          <div className="client-stat client-stat--download">
            <span className="client-stat__icon">
              <Download />
            </span>
            <div className="client-stat__data">
              <div className="client-stat__data--primary">
                {downloadRate.value}
                <em className="unit">{downloadRate.unit}</em>
              </div>
              <div className="client-stat__data--secondary">
                {downloadTotal.value}
                <em className="unit">{downloadTotal.unit}</em> Downloaded
              </div>
            </div>
            <LineChart
              data={transferRates.download}
              height={100}
              id="graph--download"
              limit={throttles.download}
              slug="graph--download"
              width={this.state.sidebarWidth} />
          </div>
          <div className="client-stat client-stat--upload">
            <span className="client-stat__icon">
              <Upload />
            </span>
            <div className="client-stat__data">
              <div className="client-stat__data--primary">
                {uploadRate.value}
                <em className="unit">{uploadRate.unit}</em>
              </div>
              <div className="client-stat__data--secondary">
                {uploadTotal.value}
                <em className="unit">{uploadTotal.unit}</em> Uploaded
              </div>
            </div>
            <LineChart
              data={transferRates.upload}
              height={100}
              id="graph--upload"
              limit={throttles.upload}
              slug="graph--upload"
              width={this.state.sidebarWidth} />
          </div>
        </div>
      );
    }

    return (
      <div className="client-stats sidebar__item">
        {content}
      </div>
    );
  }

}

ClientStats.defaultProps = {
  historyLength: 1
};

export default ClientStats;
