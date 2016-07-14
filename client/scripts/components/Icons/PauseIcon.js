import React from 'react';

import BaseIcon from './BaseIcon';

export default class Pause extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--pause ${this.props.className}`}
        viewBox={this.getViewBox()}>
        <path d="M13.5 51h11V9h-11v42zm22-42v42h11V9h-11z"/>
      </svg>
    );
  }
}
