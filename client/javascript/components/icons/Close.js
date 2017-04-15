import React from 'react';

import BaseIcon from './BaseIcon';

export default class Close extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--close ${this.props.className}`}
        viewBox={this.getViewBox()}>
        <polygon points="59.67 9.54 50.46 0.33 30 20.8 9.54 0.33 0.33 9.54 20.8 30 0.34 50.46 9.54 59.67 30 39.21 50.46 59.67 59.67 50.46 39.21 30 59.67 9.54"/>
      </svg>
    );
  }
}
