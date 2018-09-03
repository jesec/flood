import React from 'react';

import BaseIcon from './BaseIcon';

export default class UploadThickIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--upload ${this.props.className}`} viewBox={this.getViewBox()}>
        <polygon points="15.9,36.6 27,19.9 27,55 33,55 33,19.9 44.1,36.6 49.1,33.3 30,4.6 10.9,33.3 " />
      </svg>
    );
  }
}
