import React from 'react';

import BaseIcon from './BaseIcon';

export default class Start extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--start ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M13.1 9.5L46.9 30 13.1 50.5v-41z" />
      </svg>
    );
  }
}
