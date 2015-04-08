var React = require('react');
var Action = require('./Action.js');

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
                <div className="actions">
                    <Action label="Add Torrent" slug="add-torrent" clickHandler={this.handleClick} />
                    <Action label="Remove Torrent" slug="remove-torrent" clickHandler={this.handleClick} />
                </div>
            </nav>
        );
    }
});


module.exports = FilterBar;
