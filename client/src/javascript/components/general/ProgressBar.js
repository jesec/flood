import React from 'react';

export default class ProgressBar extends React.PureComponent {
  render() {
    const percent = Math.round(this.props.percent);
    const style = {};

    if (percent !== 100) {
      style.width = `${percent}%`;
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
