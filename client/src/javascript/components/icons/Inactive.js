import React from 'react';

import BaseIcon from './BaseIcon';

export default class Inactive extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--inactive ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M56,52H42l-9.7-12.5l-11,4.8L13,20.7l-7,4l-2-9.9L17.2,8l9.5,24.4l9.6-4.3l10.9,15.4H56V52z" />
      </svg>
    );
  }
}
