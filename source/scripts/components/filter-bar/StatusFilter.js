var React = require('react');

var StatusFilter = React.createClass({

    getInitialState: function() {

        return null;
    },

    render: function() {

        var filters = [
            'All',
            'Downloading',
            'Completed',
            'Active',
            'Inactive',
            'Error'
        ];

        var filterEls = filters.map(function(filter) {

            var filterSlug = filter.toLowerCase();
            var classString = 'status-filter__item status-filter__item--' + filterSlug;

            return (
                <li className={classString}>{filter}</li>
            );
        });

        return (
            <ul className="status-filter filter-bar__item">
                {filterEls}
            </ul>
        );
    }

});

module.exports = StatusFilter;
