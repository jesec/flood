var React = require('react');
var Action = require('./Action');
var UIStore = require('../../stores/UIStore');
var TorrentActions = require('../../actions/TorrentActions');

var getSelectedTorrents = function() {

    return {
        selectedTorrents: UIStore.getSelectedTorrents()
    }
};

var FilterBar = React.createClass({

    getInitialState: function() {

        return {
            selectedTorrents: []
        };
    },

    componentDidMount: function() {
        UIStore.addChangeListener(this._onUIStoreChange);
    },

    componentWillUnmount: function() {
        TorrentStore.removeChangeListener(this._onUIStoreChange);
    },

    render: function() {

        return (
            <nav className="action-bar">
                <ul className="actions">
                    <Action label="Start Torrent" slug="start-torrent" icon="start" clickHandler={this._start} />
                    <Action label="Stop Torrent" slug="stop-torrent" icon="stop" clickHandler={this._stop} />
                    <Action label="Pause Torrent" slug="pause-torrent" icon="pause" clickHandler={this._pause} />
                </ul>
            </nav>
        );
    },

    _pause: function() {

    },

    _start: function() {
        TorrentActions.start(this.state.selectedTorrents);
    },

    _stop: function() {
        TorrentActions.stop(this.state.selectedTorrents);
    },

    _onUIStoreChange: function() {
        this.setState(getSelectedTorrents);
    }

});


module.exports = FilterBar;
