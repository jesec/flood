import React from 'react';

let cachedProgressBars = {};

export default class ProgressBar extends React.Component {
  render() {
    let {percent} = this.props;
    let progressBar;

    if (cachedProgressBars[percent] != null) {
      progressBar = cachedProgressBars[percent];
    } else {
      let style = {};

      if (percent !== 100) {
        style = {transform: `scaleX(${percent / 100})`};
      }

      progressBar = (
        <div className="progress-bar__fill__wrapper">
          <div className="progress-bar__fill" style={style} />
        </div>
      );
    }

    return (
      <div className="progress-bar">
        <div className="progress-bar__icon">
          {this.props.icon}
        </div>
        {progressBar}
      </div>
    );
  }
}
