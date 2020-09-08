import React from 'react';

import BaseIcon from './BaseIcon';

export default class ClockIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--clock ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M30,6A24,24,0,0,1,47,47,24,24,0,0,1,13,13,23.85,23.85,0,0,1,30,6m0-6A30,30,0,1,0,51.21,8.79,29.91,29.91,0,0,0,30,0h0Z" />
        <polygon points="26.85 46.91 21.18 44.09 28.58 29.21 17.93 22.93 21.14 17.48 36.88 26.75 26.85 46.91" />
      </svg>
    );
  }
}
