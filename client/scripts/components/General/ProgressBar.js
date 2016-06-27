import React from 'react';

export default class ProgressBar extends React.Component {
  render() {
    return (
      <div className="progress-bar">
        <div className="progress-bar__icon">
          {this.props.icon}
        </div>
        <div className="progress-bar__fill__wrapper">
          <div className="progress-bar__fill"
            style={{width: `${this.props.percent}%`}} />
        </div>
      </div>
    );
  }
}
