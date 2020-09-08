import React from 'react';

import BaseIcon from './BaseIcon';

export default class HashIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--clock ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M30.95,42.57H24.58L21.94,58.78H14.07l2.65-16.21H7.94V35.34h10L19.64,24.9H10.91V17.67h9.92L23.56,1.22h7.83L28.7,17.67h6.37L37.79,1.22h7.87L42.93,17.67h9.13V24.9H41.74L40,35.34h9.05v7.23H38.82L36.17,58.78H28.3Zm-5.18-7.23h6.37L33.87,24.9H27.51Z" />
      </svg>
    );
  }
}
