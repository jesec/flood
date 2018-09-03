import React from 'react';

import BaseIcon from './BaseIcon';

export default class ChevronRightIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--chevron-right ${this.props.className}`} viewBox={this.getViewBox()}>
        <polygon points="18.66 58.8 12.65 52.79 35.4 30.04 12.58 7.21 18.59 1.2 47.42 30.04 18.66 58.8" />
      </svg>
    );
  }
}
