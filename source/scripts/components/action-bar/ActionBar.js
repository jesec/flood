var React = require('react');
var Action = require('./Action');
var UIStore = require('../../stores/UIStore');
var TorrentActions = require('../../actions/TorrentActions');
var UIActions = require('../../actions/UIActions');

var FilterBar = React.createClass({

    getInitialState: function() {

        return {
            selectedTorrents: []
        };
    },

    componentDidMount: function() {
        UIStore.addSelectionChangeListener(this._onUIStoreChange);
    },

    componentWillUnmount: function() {
        TorrentStore.removeChangeListener(this._onUIStoreChange);
    },

    render: function() {

        return (
            <nav className="action-bar">
                <ul className="actions action-bar__item action-bar__item--first">
                    <Action label="Start Torrent" slug="start-torrent" icon="start" clickHandler={this._start} />
                    <Action label="Stop Torrent" slug="stop-torrent" icon="stop" clickHandler={this._stop} />
                    <Action label="Pause Torrent" slug="pause-torrent" icon="pause" clickHandler={this._pause} />
                </ul>
                <ul className="actions action-bar__item action-bar__item--last">
                    <Action label="Add Torrent" slug="add-torrent" icon="add" clickHandler={this._onAddTorrent} />
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
        this.setState({
            selectedTorrents: UIStore.getSelectedTorrents()
        });
    },

    _onAddTorrent: function() {
        UIActions.toggleAddTorrentModal();
    }

});


module.exports = FilterBar;
