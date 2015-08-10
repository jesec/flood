var React = require('react');
var UIActions = require('../../actions/UIActions');
var TorrentStore = require('../../stores/TorrentStore');
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
      <li className={classNames} onClick={this._onClick}>{this.props.name}</li>
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
