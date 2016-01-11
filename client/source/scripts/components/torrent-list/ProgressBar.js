import React from 'react';

export default class ProgressBar extends React.Component {
  render() {
    let percent = this.props.percent;
    let className = 'progress-bar';

    return (
      <div className={className}>
        <div className="progress-bar__fill" style={{width: percent + '%'}}></div>
      </div>
    );
  }
}
