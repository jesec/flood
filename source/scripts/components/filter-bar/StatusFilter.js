var React = require('react');
var UIActions = require('../../actions/UIActions');
var TorrentStore = require('../../stores/TorrentStore');
var Icon = require('../icons/Icon.js');
var classnames = require('classnames');

var StatusFilter = React.createClass({

  getInitialState: function() {

    return {
      activeFilter: TorrentStore.getFilterCriteria()
    }
  },

  componentDidMount: function() {
    TorrentStore.addFilterChangeListener(this._onFilterChange);
  },

  componentWillUnmount: function() {
    TorrentStore.removeFilterChangeListener(this._onFilterChange);
  },

  render: function() {

    var itemClass = 'status-filter__item--' + this.props.slug;

    var classNames = classnames({
      'status-filter__item': true,
      itemClass: true,
      'is-active': this.state.activeFilter === this.props.slug
    });

    return (
      <li className={classNames} onClick={this._onClick}>
        <Icon icon={this.props.icon} />
        {this.props.name}
      </li>
    );
  },

  _onClick: function(action) {
    UIActions.filterTorrentList(this.props.slug);
  },

  _onFilterChange: function() {
    this.setState({
      activeFilter: TorrentStore.getFilterCriteria()
    })
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
        <li className="status-filter__item status-filter__item--heading">
          Filter by Status
        </li>
        <StatusFilter icon="all" name="All" slug="all" />
        <StatusFilter icon="downloadSmall" name="Downloading" slug="downloading" />
        <StatusFilter icon="completed" name="Completed" slug="completed" />
        <StatusFilter icon="active" name="Active" slug="active" />
        <StatusFilter icon="inactive" name="Inactive" slug="inactive" />
        <StatusFilter icon="error" name="Error" slug="error" />
      </ul>
    );
  }

});

module.exports = StatusFilterList;
