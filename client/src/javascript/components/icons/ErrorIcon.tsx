import React from 'react';

import BaseIcon from './BaseIcon';

export default class Error extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--error ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M34.3,51.3h-8.5v-9h8.5V51.3z M34.3,36.4h-8.5L23.6,8.7h12.7L34.3,36.4z" />
      </svg>
    );
  }
}
