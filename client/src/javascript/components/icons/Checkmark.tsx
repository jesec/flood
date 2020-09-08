import React from 'react';

import BaseIcon from './BaseIcon';

export default class Checkmark extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--checkmark ${this.props.className}`} viewBox={this.getViewBox()}>
        <polygon points="55.5,18.6 46.1,8.7 24.4,31.5 13.9,20.4 4.5,30.3 24.4,51.3 24.4,51.3 24.4,51.3" />
      </svg>
    );
  }
}
