import React from 'react';

import BaseIcon from './BaseIcon';

export default class LoadingIndicatorDots extends BaseIcon {
  render() {
    return (
      <svg
        className={`icon icon--loading-indicator loading-indicator--dots ${this.props.className}`}
        viewBox={this.getViewBox()}>
        <path
          className="loading-indicator--dots__dot loading-indicator--dots__dot--right"
          d="M25,11.74h4.73a1.89,1.89,0,0,1,1.89,1.89v4.73a1.89,1.89,0,0,1-1.89,1.89H25a1.89,1.89,0,0,1-1.89-1.89V13.63A1.89,1.89,0,0,1,25,11.74Z"
        />
        <path
          className="loading-indicator--dots__dot loading-indicator--dots__dot--center"
          d="M13.63,11.74h4.73a1.89,1.89,0,0,1,1.89,1.89v4.73a1.89,1.89,0,0,1-1.89,1.89H13.63a1.89,1.89,0,0,1-1.89-1.89V13.63A1.89,1.89,0,0,1,13.63,11.74Z"
        />
        <path
          className="loading-indicator--dots__dot loading-indicator--dots__dot--left"
          d="M2.27,11.74H7A1.89,1.89,0,0,1,8.9,13.63v4.73A1.89,1.89,0,0,1,7,20.26H2.27A1.89,1.89,0,0,1,.38,18.37V13.63A1.89,1.89,0,0,1,2.27,11.74Z"
        />
      </svg>
    );
  }
}
