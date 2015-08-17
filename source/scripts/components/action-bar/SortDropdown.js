var React = require('react/addons');
var TransitionGroup = React.addons.CSSTransitionGroup;
var classnames = require('classnames');
var UIActions = require('../../actions/UIActions');

var SortDropdown = React.createClass({

  componentDidMount: function() {
    window.addEventListener('click', this._handleExternalClick);
  },

  componentWillUnmount: function() {
    window.removeEventListener('click', this._handleExternalClick);
  },

  getInitialState: function() {
    return {
      sortBy: {
        displayName: 'Name',
        property: 'name',
        direction: 'desc'
      },
      isExpanded: false
    }
  },

  getMenu: function() {
    var sortableProperties = [
      {
        displayName: 'Name',
        property: 'name'
      },
      {
        displayName: 'ETA',
        property: 'seconds'
      },
      {
        displayName: 'Download Speed',
        property: 'downloadRate'
      },
      {
        displayName: 'Upload Speed',
        property: 'uploadRate'
      },
      {
        displayName: 'Ratio',
        property: 'ratio'
      },
      {
        displayName: 'Percent Complete',
        property: 'percentComplete'
      },
      {
        displayName: 'Downloaded',
        property: 'downloadTotal'
      },
      {
        displayName: 'Uploaded',
        property: 'uploadTotal'
      },
      {
        displayName: 'File Size',
        property: 'sizeBytes'
      }
    ];

    var menuItems = sortableProperties.map(function(property, index) {
      return (
        <li className="dropdown__content__item" key={index} onClick={this._handleMenuClick.bind(this, property)}>
          {property.displayName}
        </li>
      );
    }, this);

    return (
      <ul className="dropdown__content" onClick={this._handleMenuWrapperClick}>
        <li className="dropdown__content__header">Sort Torrents</li>
        {menuItems}
      </ul>
    );
  },

  render: function() {

    var classSet = classnames({
      'dropdown': true,
      'is-expanded': this.state.isExpanded
    });

    var menu = null;

    if (this.state.isExpanded) {
      menu = this.getMenu();
    }

    return (
      <div className={classSet}>
        <a className="dropdown__button" onClick={this._handleButtonClick}>
          <label className="dropdown__label">Sort By</label>
          <span className="dropdown__value">{this.state.sortBy.displayName}</span>
        </a>
        <TransitionGroup transitionName="dropdown__content">
          {menu}
        </TransitionGroup>
      </div>
    );
  },

  _handleButtonClick: function(evt) {
    evt.stopPropagation();
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  },

  _handleExternalClick: function() {
    if (this.state.isExpanded) {
      this.setState({
        isExpanded: false
      });
    }
  },

  _handleMenuClick: function(property) {
    this.setState({
      isExpanded: false,
      sortBy: {
        displayName: property.displayName,
        property: property.property
      }
    });
    UIActions.sortTorrents(property.property, this.state.sortBy.direction);
  },

  _handleMenuWrapperClick: function(evt) {
    evt.stopPropagation();
  }
});

module.exports = SortDropdown;
