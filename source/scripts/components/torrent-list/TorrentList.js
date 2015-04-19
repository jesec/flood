var React = require('react');
var Torrent = require('./Torrent');
var TorrentStore = require('../../stores/TorrentStore');
var UIStore = require('../../stores/UIStore');

var getTorrentList = function() {

    var torrentList = TorrentStore.getAll();

    return {
        allTorrents: torrentList,
        spacerBottom: getSpacerBottom(this.state.maxTorrentIndex, torrentList.length, this.state.torrentHeight)
    }
};

var getSelectedTorrents = function() {

    return {
        selectedTorrents: UIStore.getSelectedTorrents()
    }
};

var getSpacerTop = function(minVisible, height) {

    var invisible = minVisible;
    var spacerHeight = 0;

    if (invisible > 0) {
        spacerHeight = invisible * height;
    }

    return spacerHeight;
};

var getSpacerBottom = function(maxVisible, count, height) {

    var invisible = count - maxVisible;
    var spacerHeight = 0;

    if (invisible > 0) {
        spacerHeight = invisible * height
    }

    return spacerHeight;
};

var TorrentList = React.createClass({

    getInitialState: function() {

        // recalculate these values when appropriate

        return {
            allTorrents: [],
            selectedTorrents: [],
            torrentHeight: 53,
            viewportHeight: 265,
            minTorrentIndex: 0,
            maxTorrentIndex: 4,
            spacerTop: 0,
            spacerBottom: 0
        };
    },

    componentDidMount: function() {
        TorrentStore.addChangeListener(this._onTorrentStoreChange);
        UIStore.addChangeListener(this._onUIStoreChange);
    },

    componentWillUnmount: function() {
        TorrentStore.removeChangeListener(this._onTorrentStoreChange);
        UIStore.removeChangeListener(this._onUIStoreChange);
    },

    render: function() {

        var torrents = this.state.allTorrents;

        var that = this;

        var torrentList = torrents.map(function(torrent, index) {

            if (index >= that.state.minTorrentIndex && index <= that.state.maxTorrentIndex) {

                var isSelected = false;
                var hash = torrent.hash;

                if (that.state.selectedTorrents.indexOf(hash) > -1) {
                    isSelected = true;
                }

                return (
                    <Torrent key={hash} data={torrent} selected={isSelected} />
                );
            }

        });

        return (
            <ul className="torrent__list" ref="torrentList" onScroll={this._onScroll}>
                <li className="torrent__spacer torrent__spacer--top" style={{height: this.state.spacerTop + 'px'}}></li>
                {torrentList}
                <li className="torrent__spacer torrent__spacer--bottom" style={{height: this.state.spacerBottom + 'px'}}></li>
            </ul>
        );
    },

    _onTorrentStoreChange: function() {
        this.setState(getTorrentList);
    },

    _onUIStoreChange: function() {
        this.setState(getSelectedTorrents);
    },

    _onScroll: function(event) {

        // debounce this event

        var buffer = 1;
        var scrolledPosition = event.target.scrollTop;
        var totalTorrents = this.state.allTorrents.length;
        var elementsInView = Math.floor(this.state.viewportHeight / this.state.torrentHeight);
        var hiddenItemsTop = Math.floor(scrolledPosition / this.state.torrentHeight) - buffer;
        var hiddenItemsBottom = hiddenItemsTop + elementsInView + buffer;

        this.setState({
            minTorrentIndex: hiddenItemsTop,
            maxTorrentIndex: hiddenItemsBottom,
            spacerTop: getSpacerTop(hiddenItemsTop, this.state.torrentHeight),
            spacerBottom: getSpacerBottom(hiddenItemsBottom, totalTorrents, this.state.torrentHeight)
        });

    }

});

module.exports = TorrentList;
