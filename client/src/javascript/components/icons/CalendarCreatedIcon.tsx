import React from 'react';

import BaseIcon from './BaseIcon';

export default class CalendarCreatedIcon extends BaseIcon {
  render() {
    return (
      <svg
        className={`icon icon--calendar icon--calendar--created ${this.props.className}`}
        viewBox={this.getViewBox()}>
        <path d="M48,9.39V1.15H36V9.39H24.1V1.15h-12V9.39H4V58.85H56V9.39ZM40,5.29h4v7.28H40Zm-23.93,0h4v7.28h-4Zm33.38,48H9.9V16.91H49.5Z" />
        <polygon points="42.88 32 33 32 33 22.12 27 22.12 27 32 17.12 32 17.12 38 27 38 27 47.88 33 47.88 33 38 42.88 38 42.88 32" />
      </svg>
    );
  }
}
