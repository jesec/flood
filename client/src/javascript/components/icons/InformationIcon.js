import React from 'react';

import BaseIcon from './BaseIcon';

export default class InformationIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--information ${this.props.className}`} viewBox={this.getViewBox()}>
        <path
          className="icon--information__gylph"
          d="M27.14,28.26h5.72V43.95H27.14V28.26ZM30,24.44a4,4,0,1,0-4-4A4,4,0,0,0,30,24.44Z"
        />
        <circle className="icon--information__fill" cx="30" cy="30" r="29.64" />
        <path
          className="icon--information__ring"
          d="M30,0.36A29.64,29.64,0,1,0,59.64,30,29.64,29.64,0,0,0,30,.36Zm0,55.79A26.15,26.15,0,1,1,56.15,30,26.15,26.15,0,0,1,30,56.15Z"
        />
      </svg>
    );
  }
}
