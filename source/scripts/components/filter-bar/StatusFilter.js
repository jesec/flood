var React = require('react');
var UIActions = require('../../actions/UIActions');
var classnames = require('classnames');

var StatusFilter = React.createClass({

    render: function() {

        var uniqueClass = 'status-filter__item--' + this.props.slug;

        var classNames = classnames({
            'status-filter__item': true,
            uniqueClass: true
        });

        return (
            <li className={classNames} onClick={this._onClick}>{this.props.name}</li>
        );
    },

    _onClick: function(action) {
        UIActions.filterTorrentList(this.props.slug);
    }

});

var StatusFilterList = React.createClass({

    render: function() {

        var filters = [
            'All',
            'Downloading',
            'Completed',
            'Active',
            'Inactive',
            'Error'
        ];

        return (
            <ul className="status-filter filter-bar__item">
                <StatusFilter name="All" slug="all" />
                <StatusFilter name="Downloading" slug="downloading" />
                <StatusFilter name="Completed" slug="completed" />
                <StatusFilter name="Active" slug="active" />
                <StatusFilter name="Inactive" slug="inactive" />
                <StatusFilter name="Error" slug="error" />
            </ul>
        );
    }

});

module.exports = StatusFilterList;
