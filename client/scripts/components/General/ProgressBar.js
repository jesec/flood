import React from 'react';

export default class ProgressBar extends React.Component {
  render() {
    let style = {};

    if (this.props.percent !== 100) {
      style = {transform: `scaleX(${this.props.percent / 100})`};
    }

    return (
      <div className="progress-bar">
        <div className="progress-bar__icon">
          {this.props.icon}
        </div>
        <div className="progress-bar__fill__wrapper">
          <div className="progress-bar__fill" style={style} />
        </div>
      </div>
    );
  }
}
