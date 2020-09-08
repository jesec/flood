import React from 'react';

import BaseIcon from './BaseIcon';

export default class AddMini extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--addmini ${this.props.className}`} viewBox={this.getViewBox()}>
        <polygon points="8,3.5 4.5,3.5 4.5,0 3.5,0 3.5,3.5 0,3.5 0,4.5 3.5,4.5 3.5,8 4.5,8 4.5,4.5 8,4.5" />
      </svg>
    );
  }
}
