var React = require('react');
var ClientStats = require('./ClientStats');
var StatusFilter = require('./StatusFilter');
var SearchBox = require('./SearchBox');
var UIActions = require('../../actions/UIActions');

var FilterBar = React.createClass({

  getInitialState: function() {

    return null;
  },

  render: function() {

    return (
      <nav className="filter-bar">
        <ClientStats />
        <SearchBox searchChangeHandler={this._onSearchChange} />
        <StatusFilter />
      </nav>
    );
  },

  _onSearchChange: function(value) {
    UIActions.searchTorrents(value);
  }

});


module.exports = FilterBar;
