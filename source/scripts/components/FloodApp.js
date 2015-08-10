var React = require('react');
var FilterBar = require('./filter-bar/FilterBar');
var ActionBar = require('./action-bar/ActionBar');
var TorrentStore = require('../stores/TorrentStore');
var UIStore = require('../stores/UIStore');
var TorrentList = require('./torrent-list/TorrentList');
var TorrentListHeader = require('./torrent-list/TorrentListHeader');
var Modals = require('./modals/Modals');

var FloodApp = React.createClass({

  getInitialState: function() {
    return {
      modal: null,
      sortCriteria: {
        direction: 'asc',
        property: 'name'
      }
    };
  },

  componentDidMount: function() {
    TorrentStore.addSortChangeListener(this._onSortChange);
    UIStore.addModalChangeListener(this._onModalChange);
  },

  componentWillUnmount: function() {
    TorrentStore.removeSortChangeListener(this._onSortChange);
    UIStore.removeModalChangeListener(this._onModalChange);
  },

  render: function() {

    return (
      <div className="flood">
        <Modals type={this.state.modal} />
        <FilterBar />
        <main className="main">
          <ActionBar />
          <TorrentList />
        </main>
      </div>
    );
  },

  _onSortChange: function() {
    this.setState({
      sortCriteria: TorrentStore.getSortCriteria()
    });
  },

  _onModalChange: function() {
    this.setState({
      modal: UIStore.getActiveModal()
    });
  }

});

module.exports = FloodApp;
