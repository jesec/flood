import React from 'react';

import BaseIcon from './BaseIcon';

export default class Logout extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--logout ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M48.65,11H25.09a3.93,3.93,0,1,1-.37-7.85H52.57A3.92,3.92,0,0,1,56.5,7.05h0V52.94a3.93,3.93,0,0,1-3.92,3.92H25.09A3.93,3.93,0,0,1,24.72,49H48.65ZM27.4,26.08,23,21.67a3.92,3.92,0,0,1,5.55-5.55h0l11.1,11.1a3.92,3.92,0,0,1,0,5.54l0,0-11.1,11.1A3.92,3.92,0,1,1,23,38.33l4.41-4.41h-20a3.92,3.92,0,0,1,0-7.84Z" />
      </svg>
    );
  }
}
