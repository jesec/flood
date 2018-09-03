import React from 'react';

import BaseIcon from './BaseIcon';

export default class CircleExclamationIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--circle-checkmark ${this.props.className}`} viewBox={this.getViewBox()}>
        <path fillOpacity="0.05" d="M30,0A30,30,0,1,1,0,30,30,30,0,0,1,30,0Z" />
        <path
          fillOpacity="0.2"
          d="M30,0A30,30,0,1,0,60,30,30,30,0,0,0,30,0Zm0,56.47A26.47,26.47,0,1,1,56.47,30,26.47,26.47,0,0,1,30,56.47Z"
        />
        <path d="M30,39.18a3.12,3.12,0,0,1,2.26.83,3,3,0,0,1,0,4.21,3.48,3.48,0,0,1-4.5,0,2.79,2.79,0,0,1-.86-2.1A2.82,2.82,0,0,1,27.75,40,3.07,3.07,0,0,1,30,39.18Zm2.31-3H27.68L27,16.72H33Z" />
      </svg>
    );
  }
}
