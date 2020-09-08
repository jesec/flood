import React from 'react';

import BaseIcon from './BaseIcon';

export default class Limits extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--limits ${this.props.className}`} viewBox={this.getViewBox()}>
        <path
          className="limits__bars--bottom"
          d="M24.4,48.5c0,3.3,2.5,6,5.6,6s5.6-2.7,5.6-6V18.6H24.4V48.5z M4.4,48.2c0,3.5,2.5,6.3,5.6,6.3 s5.6-2.8,5.6-6.3v-9.3H4.4V48.2z M44.4,30v18.2c0,3.5,2.5,6.3,5.6,6.3s5.6-2.8,5.6-6.3V30H44.4z"
        />
        <path className="limits__bars--top" d="M24.4,18.7v-7.6c0-3.1,2.5-5.5,5.6-5.5s5.6,2.5,5.6,5.5v7.6H24.4z" />
        <path className="limits__bars--top" d="M4.4,38.9v-27c0-3.5,2.5-6.3,5.6-6.3s5.6,2.8,5.6,6.3v27H4.4z" />
        <path className="limits__bars--top" d="M44.4,29.9V11.8c0-3.5,2.5-6.3,5.6-6.3s5.6,2.8,5.6,6.3v18.1H44.4z" />
        <path
          className="limits__bars--middle"
          d="M22.2,16.4h15.6c1.2,0,2.2,1,2.2,2.2c0,1.2-1,2.2-2.2,2.2H22.2c-1.2,0-2.2-1-2.2-2.2 C20,17.4,21,16.4,22.2,16.4z"
        />
        <path
          className="limits__bars--middle"
          d="M2.2,36.7h15.6c1.2,0,2.2,1,2.2,2.2c0,1.2-1,2.2-2.2,2.2H2.2c-1.2,0-2.2-1-2.2-2.2C0,37.7,1,36.7,2.2,36.7z"
        />
        <path
          className="limits__bars--middle"
          d="M42.2,27.8h15.6c1.2,0,2.2,1,2.2,2.2s-1,2.2-2.2,2.2H42.2c-1.2,0-2.2-1-2.2-2.2S41,27.8,42.2,27.8z"
        />
      </svg>
    );
  }
}
