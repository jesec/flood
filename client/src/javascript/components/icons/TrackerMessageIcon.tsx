import React from 'react';

import BaseIcon from './BaseIcon';

export default class TrackerMessageIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--seeds ${this.props.className}`} viewBox={this.getViewBox()}>
        <circle cx="11.08" cy="30" r="5.94" />
        <circle cx="30" cy="30" r="5.94" />
        <circle cx="48.92" cy="30" r="5.94" />
      </svg>
    );
  }
}
