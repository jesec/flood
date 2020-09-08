import React from 'react';

import BaseIcon from './BaseIcon';

export default class DotsMini extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--dots-mini ${this.props.className}`} viewBox={this.getViewBox()}>
        <circle cx="0.9" cy="4" r="0.9" />
        <circle cx="4" cy="4" r="0.9" />
        <circle cx="7.1" cy="4" r="0.9" />
      </svg>
    );
  }
}
