import * as React from 'react';

interface ProgressBarProps {
  percent: number;
  icon?: JSX.Element;
}

export default class ProgressBar extends React.PureComponent<ProgressBarProps> {
  render() {
    const {percent, icon} = this.props;
    const roundedPercent = Math.round(percent);
    const style: React.CSSProperties = {};

    if (roundedPercent !== 100) {
      style.width = `${roundedPercent}%`;
    }

    return (
      <div className="progress-bar">
        <div className="progress-bar__icon">{icon}</div>
        <div className="progress-bar__fill__wrapper">
          <div className="progress-bar__fill" style={style} />
        </div>
      </div>
    );
  }
}
