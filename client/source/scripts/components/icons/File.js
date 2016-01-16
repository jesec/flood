import React from 'react';

import BaseIcon from './BaseIcon';

export default class File extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--file ${this.props.className}`}
        xmlns={this.getXmlns()} viewBox={this.getViewBox()}>
        <path d="M49.4,15.3l-8.6-8.9c-1-1.1-3.1-1.9-4.5-1.9H11.4c-1.5,0-2.7,1.2-2.7,2.7v45.5c0,1.5,1.2,2.7,2.7,2.7h37.2 c1.5,0,2.7-1.2,2.7-2.7V20C51.3,18.5,50.4,16.4,49.4,15.3z M37.1,8.4C37.6,8.5,38,8.8,38.2,9l8.7,8.9c0.2,0.2,0.4,0.7,0.6,1.2H37.1 V8.4z M47.7,51.9H12.3V8.1h21.3V20c0,1.5,1.2,2.7,2.7,2.7h11.5V51.9z"/>
      </svg>
    );
  }
}

File.defaultProps = {
  className: ''
};
