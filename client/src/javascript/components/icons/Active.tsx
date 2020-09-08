import React from 'react';

import BaseIcon from './BaseIcon';

export default class Active extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--active ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M25.7,25.7H13v17.4H2.6L19.3,60L36,43.1H25.7V25.7z M40.7,0L24,16.9h10.3v17.4H47V16.9h10.3L40.7,0z" />
      </svg>
    );
  }
}
