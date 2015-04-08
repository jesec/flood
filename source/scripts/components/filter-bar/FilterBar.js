var React = require('react');
var ClientStats = require('./ClientStats');
var StatusFilter = require('./StatusFilter');

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
                <ClientStats />
                <StatusFilter />
            </nav>
        );
    }
});


module.exports = FilterBar;
