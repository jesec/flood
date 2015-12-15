import React from 'react';
import ReactDOM from 'react-dom';

import ClientDataStore from '../../stores/ClientDataStore';
import EventTypes from '../../constants/EventTypes';
import format from '../../util/formatData';
import Icon from '../icons/Icon';
import LineChart from './LineChart';

const methodsToBind = [
  'onTransferDataRequestError',
  'onTransferDataRequestSuccess'
];

class ClientStats extends React.Component {
  constructor() {
    super();

    this.state = {
      sidebarWidth: 0,
      transferDataRequestError: false,
      transferDataRequestSuccess: false
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.setState({
      sidebarWidth: ReactDOM.findDOMNode(this).offsetWidth
    });
    ClientDataStore.listen(
      EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess
    );
    ClientDataStore.fetchTransferData();
  }

  componentWillUnmount() {
    ClientDataStore.unlisten(
      EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess
    );
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
  }

  render() {
    if (this.state.transferDataRequestError) {
      return <div>Error</div>;
    } else if (!this.state.transferDataRequestSuccess) {
      return <div>Loading</div>;
    }

    let transferRate = ClientDataStore.getTransferRate();
    let transferRates = ClientDataStore.getTransferRates();
    let transferTotals = ClientDataStore.getTransferTotals();

    let uploadRate = format.data(transferRate.upload, '/s');
    let uploadTotal = format.data(transferTotals.upload);
    let downloadRate = format.data(transferRate.download, '/s');
    let downloadTotal = format.data(transferTotals.download);

    return (
      <div className="client-stats sidebar__item">
        <div className="client-stat client-stat--download">
          <span className="client-stat__icon">
            <Icon icon="download" />
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
            slug="graph--download"
            width={this.state.sidebarWidth} />
        </div>
        <div className="client-stat client-stat--upload">
          <span className="client-stat__icon">
            <Icon icon="upload" />
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
            slug="graph--upload"
            width={this.state.sidebarWidth} />
        </div>
        <button className="client-stats client-stat--limits">
          <Icon icon="limits" /> Limits
        </button>
      </div>
    );
  }

}

ClientStats.defaultProps = {
  historyLength: 20
};

export default ClientStats;
