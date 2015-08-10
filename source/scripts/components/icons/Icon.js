var React = require('react');

var Icon = React.createClass({

  getInitialState: function() {
    return null;
  },

  render: function() {

    var icon = this._icons[this.props.icon]();
    var className = 'icon icon--' + this.props.icon;

    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
        {icon}
      </svg>
    );
  },

  _icons: {

    add: function() {

      return (
        <path fill-rule="evenodd" clip-rule="evenodd" fill="#010101" d="M53.7 25.3h-19v-19h-9.4v19h-19v9.4h19v19h9.4v-19h19"/>
      );
    },

    pause: function() {

      return (
        <path d="M13.5 51h11V9h-11v42zm22-42v42h11V9h-11z" fill-rule="evenodd" clip-rule="evenodd"/>
      )
    },

    start: function() {

      return (
        <path d="M13.1 9.5L46.9 30 13.1 50.5v-41z" fill-rule="evenodd" clip-rule="evenodd"/>
      )
    },

    stop: function () {

      return (
        <path d="M11.9 11.9H48v36.2H11.9V11.9z" fill-rule="evenodd" clip-rule="evenodd"/>
      )
    }
  }

});

module.exports = Icon;
