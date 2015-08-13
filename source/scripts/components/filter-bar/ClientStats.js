var React = require('react');
var ClientStore = require('../../stores/ClientStore');
var Icon = require('../icons/Icon');
var format = require('../../helpers/formatData');

var getClientStats = function() {
  return {
    clientStats: ClientStore.getStats()
  }
}

var ClientStats = React.createClass({

  getInitialState: function() {
    return {
      clientStats: {
        speed: {
          upload: 0,
          download: 0
        },
        transferred: {
          upload: 0,
          download: 0
        }
      }
    };
  },

  componentDidMount: function() {
    ClientStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    ClientStore.removeChangeListener(this._onChange);
  },

  render: function() {

    var uploadSpeed = format.data(this.state.clientStats.speed.upload, '/s');
    var uploadTotal = format.data(this.state.clientStats.transferred.upload);
    var downloadSpeed = format.data(this.state.clientStats.speed.download, '/s');
    var downloadTotal = format.data(this.state.clientStats.transferred.download);

    return (
      <div className="client-stats filter-bar__item">
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
              200<em className="unit">kB/s</em> Limit
            </div>
            <div className="client-stat__data--secondary">
              {downloadTotal.value}
              <em className="unit">{downloadTotal.unit}</em> Downloaded
            </div>
          </div>
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
              200<em className="unit">kB/s</em> Limit
            </div>
            <div className="client-stat__data--secondary">
              {uploadTotal.value}
              <em className="unit">{uploadTotal.unit}</em> Uploaded
            </div>
          </div>
        </div>
        <button className="client-stats client-stat--limits">
          <Icon icon="limits" /> Limits
        </button>
      </div>
    );
  },

  _onChange: function() {
    this.setState(getClientStats);
  }
});

module.exports = ClientStats;
