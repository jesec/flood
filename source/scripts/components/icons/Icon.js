var React = require('react');

var Icon = React.createClass({

    getInitialState: function() {
        return null;
    },

    render: function() {

        var icon = this._icons[this.props.icon]();
        var className = 'icon icon--' + this.props.icon;

        return (
            <svg className={className} viewBox="0 0 60 60">
                {icon}
            </svg>
        );
    },

    _icons: {

        start: function() {

            return (
                <path d="M13.1 9.5L46.9 30 13.1 50.5v-41z" fill-rule="evenodd" clip-rule="evenodd"/>
            )
        },

        stop: function () {

            return (
                <path d="M11.9 11.9H48v36.2H11.9V11.9z" fill-rule="evenodd" clip-rule="evenodd"/>
            )
        },

        pause: function() {

            return (
                <path d="M13.5 51h11V9h-11v42zm22-42v42h11V9h-11z" fill-rule="evenodd" clip-rule="evenodd"/>
            )
        }
    }

});

module.exports = Icon;
