var React = require('react');

var ProgressBar = React.createClass({
  render: function() {
    var percent = this.props.percent;
    var className = 'progress-bar';

    return (
      <div className={className}>
        <div className="progress-bar__fill" style={{width: percent + '%'}}></div>
      </div>
    );
  }

});

module.exports = ProgressBar;
