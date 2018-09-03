import React from 'react';

import BaseIcon from './BaseIcon';

export default class CommentIcon extends BaseIcon {
  render() {
    return (
      <svg
        className={`icon icon--calendar icon--calendar--created ${this.props.className}`}
        viewBox={this.getViewBox()}>
        <path d="M30,47.7a44.56,44.56,0,0,1-4.7-.26,35.55,35.55,0,0,1-14.9,7.84A26.73,26.73,0,0,1,6.71,56a1.5,1.5,0,0,1-1.56-1.23v0c-.16-.81.39-1.3.88-1.88,2-2.3,4.37-4.24,5.9-9.66C5.25,39.41,1,33.54,1,27,1,15.53,14,6.23,30,6.23S59,15.5,59,27,46,47.7,30,47.7Z" />
      </svg>
    );
  }
}
