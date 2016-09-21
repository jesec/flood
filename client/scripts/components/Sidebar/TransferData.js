import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import {FormattedMessage} from 'react-intl';
import React from 'react';
import ReactDOM from 'react-dom';

import Download from '../Icons/Download';
import EventTypes from '../../constants/EventTypes';
import LineChart from '../General/LineChart';
import LoadingIndicator from '../General/LoadingIndicator';
import Size from '../General/Size';
import TransferDataStore from '../../stores/TransferDataStore';
import UIStore from '../../stores/UIStore';
import Upload from '../Icons/Upload';

const METHODS_TO_BIND = [
  'onTransferDataRequestError',
  'onTransferDataRequestSuccess',
  'onTransferHistoryRequestSuccess'
];

class TransferData extends React.Component {
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
    let content = <LoadingIndicator inverse={true} />;

    if (!this.isLoading()) {
      let throttles = TransferDataStore.getThrottles();
      let transferRate = TransferDataStore.getTransferRate();
      let transferRates = TransferDataStore.getTransferRates();
      let transferTotals = TransferDataStore.getTransferTotals();

      content = (
        <div key="loaded">
          <div className="client-stat client-stat--download">
            <span className="client-stat__icon">
              <Download />
            </span>
            <div className="client-stat__data">
              <div className="client-stat__data--primary">
                <Size value={transferRate.download} isSpeed={true} />
              </div>
              <div className="client-stat__data--secondary">
                <Size value={transferTotals.download} /> <FormattedMessage
                  id="sidebar.transferdata.downloaded"
                  defaultMessage="Downloaded"
                />
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
                <Size value={transferRate.upload} isSpeed={true} />
              </div>
              <div className="client-stat__data--secondary">
                <Size value={transferTotals.upload} /> <FormattedMessage
                  id="sidebar.transferdata.uploaded"
                  defaultMessage="Uploaded"
                />
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

TransferData.defaultProps = {
  historyLength: 1
};

export default TransferData;
