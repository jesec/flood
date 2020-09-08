import React from 'react';

import BaseIcon from './BaseIcon';

export default class Ratio extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--ratio ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M54.57,15.76a28.56,28.56,0,1,0-10.45,39A28.56,28.56,0,0,0,54.57,15.76ZM9.68,41.86a23.36,23.36,0,1,1,40.39-23.5C40.72,29.74,24.32,39.36,9.68,41.86Z" />
      </svg>
    );
  }
}
