import React from 'react';

import BaseIcon from './BaseIcon';

export default class Menu extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--menu ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M 7.5 45 L 52.5 45 L 52.5 40 L 7.5 40 Z M 7.5 32.5 L 52.5 32.5 L 52.5 27.5 L 7.5 27.5 Z M 7.5 15 L 7.5 20 L 52.5 20 L 52.5 15 Z M 7.5 15" />
      </svg>
    );
  }
}
