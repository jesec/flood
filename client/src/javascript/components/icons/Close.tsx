import React from 'react';

import BaseIcon from './BaseIcon';

export default class Close extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--close ${this.props.className}`} viewBox={this.getViewBox()}>
        <polygon points="52.5 14.48 45.52 7.5 30 23.02 14.48 7.5 7.5 14.48 23.02 30 7.51 45.52 14.48 52.5 30 36.98 45.52 52.5 52.5 45.52 36.98 30 52.5 14.48" />
      </svg>
    );
  }
}
