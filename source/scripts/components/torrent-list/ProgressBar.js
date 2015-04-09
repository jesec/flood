var React = require('react');

var ProgressBar = React.createClass({

    getInitialState: function() {

        return null;
    },

    render: function() {

        var percent = this.props.percent;

        var className = 'progress-bar progress-bar--' + (Math.floor(percent / 1) * 10);

        return (
            <div className={className}>
                <div className="progress-bar__fill" style={{width: percent + '%'}}></div>
            </div>
        );
    }

});

module.exports = ProgressBar;
