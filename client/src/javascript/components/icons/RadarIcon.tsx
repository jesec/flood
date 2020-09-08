import React from 'react';

import BaseIcon from './BaseIcon';

export default class RadarIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--disk ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M30,59A29,29,0,1,1,59,30,29,29,0,0,1,30,59ZM30,6A24,24,0,1,0,54,30,24,24,0,0,0,30,6Z" />
        <path d="M30,45.75A15.75,15.75,0,1,1,45.75,30,15.77,15.77,0,0,1,30,45.75Zm0-26.5A10.75,10.75,0,1,0,40.75,30,10.76,10.76,0,0,0,30,19.25Z" />
        <polygon points="30 30 56.5 30 53.16 42.88 43.65 52.71 30 30" />
      </svg>
    );
  }
}
