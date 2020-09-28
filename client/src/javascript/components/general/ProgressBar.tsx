import React from 'react';

interface ProgressBarProps {
  percent: number;
  icon?: JSX.Element;
}

export default class ProgressBar extends React.PureComponent<ProgressBarProps> {
  render() {
    const percent = Math.round(this.props.percent);
    const style: React.CSSProperties = {};

    if (percent !== 100) {
      style.width = `${percent}%`;
    }

    return (
      <div className="progress-bar">
        <div className="progress-bar__icon">{this.props.icon}</div>
        <div className="progress-bar__fill__wrapper">
          <div className="progress-bar__fill" style={style} />
        </div>
      </div>
    );
  }
}
