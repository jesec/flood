import React from 'react';

import BaseIcon from './BaseIcon';

export default class DiskIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--disk ${this.props.className}`} viewBox={this.getViewBox()}>
        <polygon points="51.8,0 51.8,0 51.8,3.7 51.8,56.3 8.2,56.3 8.2,3.7 8.2,0 8.2,0 4.5,0 4.5,60.1 55.5,60.1 55.5,0 	" />
        <rect x="18.4" y="8.9" width="23.1" height="3.8" />
        <path
          d="M30,51.8c3.4,0,6.8-1.1,9.6-3.3L29.4,38.4l3.1-3.1l10.2,10.1c4.3-6.1,3.8-14.5-1.7-20c-3-3-7-4.5-11-4.5
      		s-7.9,1.5-11,4.5C13,31.4,13,41.2,19,47.3C22.1,50.3,26,51.8,30,51.8z"
        />
        <rect x="40" y="0" width="3.5" height="3.8" />
        <rect x="45.9" y="0" width="3.5" height="3.8" />
        <rect x="34.1" y="0" width="3.5" height="3.8" />
        <rect x="16.5" y="0" width="3.5" height="3.8" />
        <rect x="10.6" y="0" width="3.5" height="3.8" />
        <rect x="22.4" y="0" width="3.5" height="3.8" />
        <rect x="28.2" y="0" width="3.5" height="3.8" />
      </svg>
    );
  }
}
