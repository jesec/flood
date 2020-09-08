import React from 'react';

import BaseIcon from './BaseIcon';

export default class RemoveMini extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--remove-mini ${this.props.className}`} viewBox={this.getViewBox()}>
        <rect y="3.5" width="8" height="1" />
      </svg>
    );
  }
}
