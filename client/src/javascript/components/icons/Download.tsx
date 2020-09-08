import React from 'react';

import BaseIcon from './BaseIcon';

export default class Download extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--download ${this.props.className}`} viewBox={this.getViewBox()}>
        <rect x="28.2" width="3.7" height="55.5" />
        <polygon points="30,60 11.8,32.7 14.9,30.7 30,53.3 45.1,30.7 48.2,32.7 " />
      </svg>
    );
  }
}
