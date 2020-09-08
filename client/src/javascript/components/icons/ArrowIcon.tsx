import React from 'react';

import BaseIcon from './BaseIcon';

export default class ArrowIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--arrow ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M25.78,42.22V1.16h8.43V42.22L48,27.77l6.1,5.83L30,58.84,5.87,33.6,12,27.77Z" />
      </svg>
    );
  }
}
