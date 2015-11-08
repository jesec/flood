import React from 'react';
import ReactDOM from 'react-dom';

import format from '../../helpers/formatData';
import Icon from '../icons/Icon';
import LineChart from './LineChart';

const methodsToBind = [
  'componentDidMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate'
];

export default class ClientStats extends React.Component {

  constructor() {
    super();

    this.state = {
      sidebarWidth: 0,
      transferData: {
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

  componentWillReceiveProps(nextProps) {
    // check that the transferData was actually updated since the last component
    // update. if it was updated, add the latest download & upload rates to the
    // end of the array and remove the first element in the array. if the arrays
    // are empty, fill in zeros for the first n entries.
    if (nextProps.transferData.updatedAt !== this.props.transferData.updatedAt) {
      let index = 0;
      let uploadRateHistory = Object.assign([], this.state.transferData.upload);
      let downloadRateHistory = Object.assign([], this.state.transferData.download);

      if (uploadRateHistory.length === this.props.historyLength) {
        uploadRateHistory.shift();
        downloadRateHistory.shift();
        uploadRateHistory.push(parseInt(nextProps.transferData.upload.rate));
        downloadRateHistory.push(parseInt(nextProps.transferData.download.rate));
      } else {
        while (index < this.props.historyLength) {
          if (index < this.props.historyLength - 1) {
            uploadRateHistory[index] = 0;
            downloadRateHistory[index] = 0;
          } else {
            uploadRateHistory[index] = parseInt(nextProps.transferData.upload.rate);
            downloadRateHistory[index] = parseInt(nextProps.transferData.download.rate);
          }
          index++;
        }
      }

      this.setState({
        transferData: {
          download: downloadRateHistory,
          upload: uploadRateHistory
        }
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.transferData.updatedAt !== this.props.transferData.updatedAt) {
      return true;
    } else {
      return true;
    }
  }

  render() {
    let uploadRate = format.data(this.props.transferData.upload.rate, '/s');
    let uploadTotal = format.data(this.props.transferData.upload.total);
    let downloadRate = format.data(this.props.transferData.download.rate, '/s');
    let downloadTotal = format.data(this.props.transferData.download.total);

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
            data={this.state.transferData.download}
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
            data={this.state.transferData.upload}
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
