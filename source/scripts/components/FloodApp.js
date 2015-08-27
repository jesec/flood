var React = require('react');
var FilterBar = require('./filter-bar/FilterBar');
var ActionBar = require('./action-bar/ActionBar');
var TorrentStore = require('../stores/TorrentStore');
var UIStore = require('../stores/UIStore');
var TorrentList = require('./torrent-list/TorrentList');
var TorrentListHeader = require('./torrent-list/TorrentListHeader');

var FloodApp = React.createClass({

  getInitialState: function() {
    return {
      sortCriteria: {
        direction: 'asc',
        property: 'name'
      }
    };
  },

  componentDidMount: function() {
    TorrentStore.addSortChangeListener(this._onSortChange);
  },

  componentWillUnmount: function() {
    TorrentStore.removeSortChangeListener(this._onSortChange);
  },

  render: function() {

    return (
      <div className="flood">
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
  }

});

module.exports = FloodApp;
