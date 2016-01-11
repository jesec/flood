import React from 'react';

import BaseIcon from './BaseIcon';

export default class Start extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--start ${this.props.className}`}
        xmlns={this.getXmlns} viewBox={this.getViewBox()}>
        <path d="M11.9 11.9H48v36.2H11.9V11.9z"/>
      </svg>
    );
  }
}

Start.defaultProps = {
  className: ''
};
