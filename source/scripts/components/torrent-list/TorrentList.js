var React = require('react');
var Torrent = require('./Torrent');
var TorrentStore = require('../../stores/TorrentStore');
var UIStore = require('../../stores/UIStore');
var UIActions = require('../../actions/UIActions');

var getTorrentList = function() {

    var torrentList = TorrentStore.getAll();

    return {
        allTorrents: torrentList,
        torrentCount: torrentList.length
    }
}

var getSelectedTorrents = function() {

    return {
        selectedTorrents: UIStore.getSelectedTorrents()
    }
}

var getListPadding = function() {

    return {
        spaceTop: UIStore.getSpaceTop(),
        spaceBottom: UIStore.getSpaceBottom()
    }
}

var getTorrentRange = function() {

    return {
        min: UIStore.getMinTorrentRendered(),
        max: UIStore.getMaxTorrentRendered()
    }
}

var TorrentList = React.createClass({

    getInitialState: function() {
        
        return {
            allTorrents: [],
            selectedTorrents: [],
            torrentCount: 0,
            torrentHeight: 53,
            minTorrentIndex: 0,
            maxTorrentIndex: 4,
            spaceTop: 0,
            spaceBottom: 0
        };
    },

    componentDidMount: function() {
        TorrentStore.addChangeListener(this._onTorrentStoreChange);
        UIStore.addSelectionChangeListener(this._onTorrentSelectionChange);
        UIStore.addViewportPaddingChangeListener(this._onViewportPaddingChange);

        UIActions.setViewportHeight(React.findDOMNode(this.refs.torrentList).offsetHeight, this.getDOMNode().scrollTop);
    },

    componentWillUnmount: function() {
        TorrentStore.removeChangeListener(this._onTorrentStoreChange);
        UIStore.removeSelectionChangeListener(this._onTorrentSelectionChange);
        UIStore.removeViewportPaddingChangeListener(this._onViewportPaddingChange);
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
                <li className="torrent__spacer torrent__spacer--top" style={{height: this.state.spaceTop + 'px'}}></li>
                {torrentList}
                <li className="torrent__spacer torrent__spacer--bottom" style={{height: this.state.spaceBottom + 'px'}}></li>
            </ul>
        );
    },

    _onTorrentStoreChange: function() {
        this.setState(getTorrentList);
    },

    _onTorrentSelectionChange: function() {
        this.setState(getSelectedTorrents);
    },

    _onViewportPaddingChange: function() {
        var listPadding = getListPadding();
        var torrentRange = getTorrentRange();

        console.log('viewport padding change, new min: ' + torrentRange.min + ' new max: ' + torrentRange.max);

        this.setState({
            minTorrentIndex: torrentRange.min,
            maxTorrentIndex: torrentRange.max,
            spaceTop: listPadding.spaceTop,
            spaceBottom: listPadding.spaceBottom
        });
    },

    _onScroll: function() {
        UIActions.scrollTorrentList(this.state.torrentCount);
    }

});

module.exports = TorrentList;
