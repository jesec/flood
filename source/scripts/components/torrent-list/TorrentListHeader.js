var React = require('react');
var FilterActions = require('../../actions/FilterActions');
var classNames = require('classnames');

var HeaderItem = React.createClass({

    getInitialState: function() {

        return {
            sorted: false,
            direction: 'asc'
        }
    },

    render: function() {

        var classes = classNames({
            'is-sorted': this.state.sorted,
            'is-sorted--asc': this.state.sorted && (this.state.direction === 'asc'),
            'is-sorted--desc': this.state.sorted && (this.state.direction === 'desc'),
            'torrent__detail--primary': this.props.primary,
            'torrent__detail--secondary--sub': !this.props.primary
        });

        classes += ' torrent__detail--' + this.props.slug;

        return (
            <span className={classes} onClick={this._onClick}>{this.props.label}</span>
        );

    },

    _onClick: function() {
        FilterActions.sortTorrents(this.props.propertyVar, this.state.direction);

        this.setState({
            sorted: true,
            direction: this.state.direction === 'asc' ? 'desc' : 'asc'
        });
    }

});

var TorrentListHeader = React.createClass({

    getInitialState: function() {

        return null;
    },

    render: function() {

        return (
            <li className="torrent__header">
                <HeaderItem primary="true" label="Name" slug="name" propertyVar="name" />
                <div className="torrent__detail--secondary">
                    <HeaderItem label="Up" slug="speed" propertyVar="uploadRate" />
                    <HeaderItem label="Down" slug="speed" propertyVar="downloadRate" />
                    <HeaderItem label="ETA" slug="eta" propertyVar="name" />
                    <HeaderItem label="Completed" slug="completed" propertyVar="bytesDone" />
                    <HeaderItem label="Size" slug="size" propertyVar="sizeBytes" />
                    <HeaderItem label="Ratio" slug="ratio" propertyVar="ratio" />
                    <HeaderItem label="Peers" slug="peers" propertyVar="name" />
                    <HeaderItem label="Seeds" slug="seeds" propertyVar="name" />
                </div>
            </li>
        );
    }

});

module.exports = TorrentListHeader;
