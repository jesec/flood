import React from 'react';

import BaseIcon from './BaseIcon';

export default class SeedsIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--seeds ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M47.95,1.4a12.05,12.05,0,0,0-11.78,9.55H23.84A12,12,0,1,0,12.05,25.5a11.92,11.92,0,0,0,3.56-.6l6,13a12.51,12.51,0,1,0,4.28-2.66L20,22.45a12,12,0,0,0,3.85-6.5H36.16A12,12,0,1,0,47.95,1.4ZM37.05,46.55A7.05,7.05,0,1,1,30,39.5,7.06,7.06,0,0,1,37.05,46.55Z" />
      </svg>
    );
  }
}
