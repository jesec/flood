import React from 'react';

import BaseIcon from './BaseIcon';

export default class Search extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--search ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M26,38.9c-7.1,0-12.8-5.8-12.8-12.8C13.2,19,19,13.2,26,13.2c7.1,0,12.8,5.8,12.8,12.8 C38.9,33.1,33.1,38.9,26,38.9z M26,18.2c-4.3,0-7.8,3.5-7.8,7.8s3.5,7.8,7.8,7.8s7.8-3.5,7.8-7.8S30.4,18.2,26,18.2z" />
        <rect
          x="30.9"
          y="36.7"
          transform="matrix(0.7071 0.7071 -0.7071 0.7071 39.1863 -16.2315)"
          width="16.5"
          height="5"
        />
      </svg>
    );
  }
}
