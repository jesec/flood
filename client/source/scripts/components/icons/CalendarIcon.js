import React from 'react';

import BaseIcon from './BaseIcon';

export default class CalendarIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--calendar ${this.props.className}`}
        xmlns={this.getXmlns()} viewBox={this.getViewBox()}>
        <path d="M51.9,9.39h-4V6.3a5.08,5.08,0,0,0-5-5.15h-2A5.08,5.08,0,0,0,36,6.3V9.39H24V6.3a5.08,5.08,0,0,0-5-5.15h-2a5.08,5.08,0,0,0-5,5.15V9.39h-4a4.08,4.08,0,0,0-4,4.12V54.74a4.08,4.08,0,0,0,4,4.12H51.9a4.08,4.08,0,0,0,4-4.12V13.51A4.08,4.08,0,0,0,51.9,9.39ZM40,6.3a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v9.28a1,1,0,0,1-1,1h-2a1,1,0,0,1-1-1V6.3Zm-23.89,0a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v9.28a1,1,0,0,1-1,1h-2a1,1,0,0,1-1-1V6.3ZM49.8,52.84H10.2V22.42H49.8V52.84Z"/>
      </svg>
    );
  }
}
