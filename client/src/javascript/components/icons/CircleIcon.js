import React from 'react';

import BaseIcon from './BaseIcon';

export default class Circle extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--circle ${this.props.className}`}
        viewBox={this.getViewBox()}>
        <circle cx="30" cy="30" r="10" />
      </svg>
    );
  }
}
