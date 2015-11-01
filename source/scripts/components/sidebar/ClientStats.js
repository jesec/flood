import React from 'react';
import ReactDOM from 'react-dom';

import format from '../../helpers/formatData';
import Icon from '../icons/Icon';
import LineChart from './LineChart';

const methodsToBind = [
  'componentDidMount',
  '_onChange'
];

export default class ClientStats extends React.Component {

  constructor() {
    super();

    this.state = {
      clientStats: {
        currentSpeed: {
          upload: 0,
          download: 0
        },
        historicalSpeed: {
          download: [],
          upload: []
        },
        transferred: {
          upload: 0,
          download: 0
        }
      },
      sidebarWidth: 0
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

  render() {
    let uploadSpeed = format.data(this.state.clientStats.currentSpeed.upload, '/s');
    let uploadTotal = format.data(this.state.clientStats.transferred.upload);
    let downloadSpeed = format.data(this.state.clientStats.currentSpeed.download, '/s');
    let downloadTotal = format.data(this.state.clientStats.transferred.download);

    return (
      <div className="client-stats sidebar__item">
        <div className="client-stat client-stat--download">
          <span className="client-stat__icon">
            <Icon icon="download" />
          </span>
          <div className="client-stat__data">
            <div className="client-stat__data--primary">
              {downloadSpeed.value}
              <em className="unit">{downloadSpeed.unit}</em>
            </div>
            <div className="client-stat__data--secondary">
              {downloadTotal.value}
              <em className="unit">{downloadTotal.unit}</em> Downloaded
            </div>
          </div>
          <LineChart
            data={this.state.clientStats.historicalSpeed.download}
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
              {uploadSpeed.value}
              <em className="unit">{uploadSpeed.unit}</em>
            </div>
            <div className="client-stat__data--secondary">
              {uploadTotal.value}
              <em className="unit">{uploadTotal.unit}</em> Uploaded
            </div>
          </div>
          <LineChart
            data={this.state.clientStats.historicalSpeed.upload}
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

  _onChange() {
    this.setState(getClientStats);
  }

}
