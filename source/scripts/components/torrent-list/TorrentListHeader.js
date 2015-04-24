var React = require('react');
var UIActions = require('../../actions/UIActions');
var classNames = require('classnames');

var HeaderItem = React.createClass({

    getInitialState: function() {

        return null;
    },

    render: function() {

        var isSorted = this.props.sortCriteria.property === this.props.propertyVar;

        var classes = classNames({
            'is-sorted': isSorted,
            'is-sorted--asc': isSorted && (this.props.sortCriteria.direction === 'asc'),
            'is-sorted--desc': isSorted && (this.props.sortCriteria.direction === 'desc'),
            'torrent__header__item': true,
            'torrent__detail--primary': this.props.primary,
            'torrent__detail--secondary--sub': !this.props.primary
        });

        classes += ' torrent__detail--' + this.props.slug;

        return (
            <span className={classes} onClick={this._onClick}>{this.props.label}</span>
        );

    },

    _onClick: function() {
        var newDirection = this.props.sortCriteria.direction === 'asc' ? 'desc' : 'asc';
        UIActions.sortTorrents(this.props.propertyVar, newDirection);
    }

});

var TorrentListHeader = React.createClass({

    getInitialState: function() {

        return null;
    },

    render: function() {

        return (
            <div className="torrent__header">
                <HeaderItem primary="true" label="Name" slug="name" propertyVar="name" sortCriteria={this.props.sortCriteria} />
                <div className="torrent__detail--secondary">
                    <HeaderItem label="Up" slug="speed" propertyVar="uploadRate" sortCriteria={this.props.sortCriteria} />
                    <HeaderItem label="Down" slug="speed" propertyVar="downloadRate" sortCriteria={this.props.sortCriteria} />
                    <HeaderItem label="ETA" slug="eta" propertyVar="eta" sortCriteria={this.props.sortCriteria} />
                    <HeaderItem label="Completed" slug="completed" propertyVar="percentComplete" sortCriteria={this.props.sortCriteria} />
                    <HeaderItem label="Size" slug="size" propertyVar="sizeBytes" sortCriteria={this.props.sortCriteria} />
                    <HeaderItem label="Ratio" slug="ratio" propertyVar="ratio" sortCriteria={this.props.sortCriteria} />
                    <HeaderItem label="Peers" slug="peers" propertyVar="name" sortCriteria={this.props.sortCriteria} />
                    <HeaderItem label="Seeds" slug="seeds" propertyVar="name" sortCriteria={this.props.sortCriteria} />
                </div>
            </div>
        );
    }

});

module.exports = TorrentListHeader;
