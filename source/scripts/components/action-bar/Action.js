var React = require('react');

var Action = React.createClass({

    getInitialState: function() {
        return null;
    },

    render: function() {

        var classString = 'action action--' + this.props.slug;

        return (
            <span className={classString} onClick={this.props.clickHandler}>{this.props.label}</span>
        );
    }
});

module.exports = Action;
