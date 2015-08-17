var React = require('react');
var Icon = require('../icons/Icon');
var TorrentActions = require('../../actions/TorrentActions');
var UIActions = require('../../actions/UIActions');

var Modal = React.createClass({

  getInitialState: function() {
    return {
      url: '',
      destination: ''
    }
  },

  render: function() {
    return (
      <aside className="modal__window" onClick={this.props.clickHandler}>
        <header className="modal__header modal__header--toggle">
          <h1>Add Torrent</h1>
        </header>
        <div className="modal__content">
          <div className="form__row">
            <input className="textbox"
              onChange={this._onUrlChange}
              placeholder="Torrent URL"
              value={this.state.url}
              type="text" />
          </div>
          <div className="form__row">
            <input className="textbox"
              onChange={this._onDestinationChange}
              placeholder="Destination"
              value={this.state.destination}
              type="text" />
          </div>
          <div className="form__row">
            <button className="button" onClick={this._onAddTorrent}>Add Torrent</button>
          </div>
        </div>
      </aside>
    );
  },

  _onDestinationChange: function(event) {
    this.setState({
      destination: event.target.value
    })
  },

  _onUrlChange: function(event) {
    this.setState({
      url: event.target.value
    })
  },

  _onAdd: function() {
    TorrentActions.add({
      method: 'url',
      url: this.state.url,
      destination: this.state.destination
    });
  }
});

module.exports = Modal;
