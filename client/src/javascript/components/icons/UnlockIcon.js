import React from 'react';

import BaseIcon from './BaseIcon';

export default class UnlockIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--unlock ${this.props.className}`}
        viewBox={this.getViewBox()}>
        <path d="m 12.140534,10.117197 0.922774,0.922774 5.593214,-5.5932146 c 7.164406,-7.1644059 18.876923,-7.2209745 25.973447,-0.1244508 7.096523,7.0965234 7.040662,18.8083334 -0.125158,25.9741534 l -5.592508,5.592508 -26.771769,-26.77177 z m 6.462248,6.462249 14.770047,14.770046 5.593214,-5.593215 C 43.07292,21.649401 43.105447,14.982798 39.037461,10.914813 34.969476,6.8468278 28.302873,6.8793547 24.19529,10.986938 l -5.592508,5.592508 z"
     fillOpacity=".4" />
        <path d="M6 27.364h46.819V59H6z" />
      </svg>
    );
  }
}


