var React = require('react');
var Icon = require('../icons/Icon');

var Action = React.createClass({

  getInitialState: function() {
    return null;
  },

  render: function() {

    var classString = 'action action--' + this.props.slug;

    return (
      <li className={classString} onClick={this.props.clickHandler}>
        <Icon icon={this.props.icon} />
        <span className="action__label">{this.props.label}</span>
      </li>
    );
  }
});

module.exports = Action;
