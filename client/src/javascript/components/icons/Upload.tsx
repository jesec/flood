import React from 'react';

import BaseIcon from './BaseIcon';

export default class Upload extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--upload ${this.props.className}`} viewBox={this.getViewBox()}>
        <rect x="28.2" y="4.5" width="3.7" height="55.5" />
        <polygon points="30,0 48.2,27.3 45.1,29.3 30,6.7 14.9,29.3 11.8,27.3 " />
      </svg>
    );
  }
}
