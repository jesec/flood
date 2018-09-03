import React from 'react';

import BaseIcon from './BaseIcon';

export default class Stop extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--stop ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M11.9 11.9H48v36.2H11.9V11.9z" />
      </svg>
    );
  }
}
