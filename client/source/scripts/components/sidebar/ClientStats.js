import { connect } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import clientSelector from '../../selectors/clientSelector';
import { fetchTransferData } from '../../actions/ClientActions';
import format from '../../helpers/formatData';
import Icon from '../icons/Icon';
import LineChart from './LineChart';

const methodsToBind = [
  'componentDidMount',
  'componentWillReceiveProps',
  'getTransferData',
  'shouldComponentUpdate'
];

class ClientStats extends React.Component {

  constructor() {
    super();

    this.state = {
      clientDataFetchInterval: null,
      sidebarWidth: 0,
      transfers: {
        download: [],
        upload: []
      }
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.setState({
      sidebarWidth: ReactDOM.findDOMNode(this).offsetWidth
    });
  }

  componentWillMount() {
    let getTransferData = this.getTransferData;

    this.state.clientDataFetchInterval = setInterval(function() {
      getTransferData();
    }, 5000);

    getTransferData();
  }

  componentWillUnmount() {
    clearInterval(this.state.clientDataFetchInterval);
  }

  componentWillReceiveProps(nextProps) {
    // check that the transfers was actually updated since the last component
    // update. if it was updated, add the latest download & upload rates to the
    // end of the array and remove the first element in the array. if the arrays
    // are empty, fill in zeros for the first n entries.
    if (nextProps.transfers.updatedAt !== this.props.transfers.updatedAt) {
      let index = 0;
      let uploadRateHistory = Object.assign([], this.state.transfers.upload);
      let downloadRateHistory = Object.assign([], this.state.transfers.download);

      if (uploadRateHistory.length === this.props.historyLength) {
        uploadRateHistory.shift();
        downloadRateHistory.shift();
        uploadRateHistory.push(parseInt(nextProps.transfers.upload.rate));
        downloadRateHistory.push(parseInt(nextProps.transfers.download.rate));
      } else {
        while (index < this.props.historyLength) {
          if (index < this.props.historyLength - 1) {
            uploadRateHistory[index] = 0;
            downloadRateHistory[index] = 0;
          } else {
            uploadRateHistory[index] = parseInt(nextProps.transfers.upload.rate);
            downloadRateHistory[index] = parseInt(nextProps.transfers.download.rate);
          }
          index++;
        }
      }

      this.setState({
        transfers: {
          download: downloadRateHistory,
          upload: uploadRateHistory
        }
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.transfers.updatedAt !== this.props.transfers.updatedAt) {
      return true;
    } else {
      return false;
    }
  }

  getTransferData() {
    this.props.dispatch(fetchTransferData());
  }

  render() {
    let uploadRate = format.data(this.props.transfers.upload.rate, '/s');
    let uploadTotal = format.data(this.props.transfers.upload.total);
    let downloadRate = format.data(this.props.transfers.download.rate, '/s');
    let downloadTotal = format.data(this.props.transfers.download.total);

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
            data={this.state.transfers.download}
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
            data={this.state.transfers.upload}
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

export default connect(clientSelector)(ClientStats);
