var React = require('react');
var ClientStats = require('./ClientStats');
var StatusFilter = require('./StatusFilter');
var SearchBox = require('./SearchBox');
var FilterActions = require('../../actions/FilterActions');

var FilterBar = React.createClass({

    getInitialState: function() {

        return null;
    },

    handleClick: function(event) {
        console.log('click ' + event.target);
    },

    render: function() {

        return (
            <nav className="filter-bar">
                <SearchBox searchChangeHandler={this._onSearchChange} />
                <ClientStats />
                <StatusFilter />
            </nav>
        );
    },

    _onSearchChange: function(event) {
        FilterActions.searchTorrents(event.target.value);
    }

});


module.exports = FilterBar;
