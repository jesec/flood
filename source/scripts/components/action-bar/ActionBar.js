var React = require('react');
var Action = require('./Action');

var FilterBar = React.createClass({

    getInitialState: function() {

        return null;
    },

    handleClick: function(event) {
        console.log('click ' + event.target);
    },

    render: function() {

        return (
            <nav className="action-bar">
                <ul className="actions">
                    <Action label="Start Torrent" slug="start-torrent" icon="start" clickHandler={this.handleClick} />
                    <Action label="Stop Torrent" slug="stop-torrent" icon="stop" clickHandler={this.handleClick} />
                    <Action label="Pause Torrent" slug="pause-torrent" icon="pause" clickHandler={this.handleClick} />
                </ul>
            </nav>
        );
    }
});


module.exports = FilterBar;
