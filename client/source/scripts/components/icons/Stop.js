import React from 'react';

import BaseIcon from './BaseIcon';

export default class Stop extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--stop ${this.props.className}`}
        xmlns="http://www.w3.org/2000/svg" viewBox={this.getViewBox()}>
        <path d="M11.9 11.9H48v36.2H11.9V11.9z"/>
      </svg>
    );
  }
}

Stop.defaultProps = {
  className: ''
};
