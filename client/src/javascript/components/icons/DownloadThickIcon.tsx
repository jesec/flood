import React from 'react';

import BaseIcon from './BaseIcon';

export default class DownloadThickIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--download ${this.props.className}`} viewBox={this.getViewBox()}>
        <polygon points="44.1,23 33,39.7 33,4.6 27,4.6 27,39.7 15.9,23 10.9,26.4 30,55 49.1,26.4 " />
      </svg>
    );
  }
}
