import React from 'react';

import BaseIcon from './BaseIcon';

export default class Edit extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--edit ${this.props.className}`} viewBox={this.getViewBox()}>
        <g transform="matrix(3.75,0,0,3.75,1.9385915,-0.26796172)">
          <g transform="translate(-384.000000, -192.000000)">
            <path d="M 385,203.95081 389,208 h -4 z M 392,196 l 4,4 -6.02136,7.04419 L 386,203 Z m 2.08462,-2.2185 c 0.62484,-0.62484 1.82467,-0.43807 2.6799,0.41715 l 0.77426,0.77427 c 0.85523,0.85523 1.042,2.05506 0.41716,2.6799 l -1.23555,1.23554 -3.87132,-3.87132 z m 0,0" />
          </g>
        </g>
      </svg>
    );
  }
}
