import React from 'react';

import BaseIcon from './BaseIcon';

export default class ClipboardIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--clipboard ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M40.23,8.2H35.3v-2a2.46,2.46,0,0,0-2.47-2.47H27.91a2.47,2.47,0,0,0-2.47,2.47v2H20.51A2.47,2.47,0,0,0,18,10.66v4.27H42.7V10.66A2.47,2.47,0,0,0,40.23,8.2Z" />
        <rect x="18.05" y="31.07" width="24.65" height="5.19" />
        <rect x="18.05" y="20.69" width="24.65" height="5.19" />
        <rect x="18.05" y="41.45" width="24.65" height="5.19" />
        <polygon points="43.93 11.47 43.93 13.94 47.63 13.94 47.63 53.38 13.12 53.38 13.12 13.94 16.81 13.94 16.81 11.47 10.65 11.47 10.65 55.85 50.1 55.85 50.1 11.47 43.93 11.47" />
      </svg>
    );
  }
}
