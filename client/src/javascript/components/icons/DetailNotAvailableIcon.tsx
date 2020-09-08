import React from 'react';

import BaseIcon from './BaseIcon';

export default class DetailNotAvailableIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--clock ${this.props.className}`} viewBox={this.getViewBox()}>
        <rect y="26.63" width="60" height="6.75" />
      </svg>
    );
  }
}
