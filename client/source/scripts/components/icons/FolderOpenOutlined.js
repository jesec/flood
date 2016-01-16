import React from 'react';

import BaseIcon from './BaseIcon';

export default class FolderOpenOutlined extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--directory-outlined ${this.props.className}`}
        xmlns={this.getXmlns} viewBox={this.getViewBox()}>
        <path d="M55.8,33c0,0.5-0.3,0.8-0.6,1.2l-9.2,11c-1.1,1.3-3.2,2.3-4.9,2.3H7.2c-0.7,0-1.7-0.2-1.7-1.1c0-0.5,0.3-0.8,0.6-1.2l9.2-11 c1.1-1.2,3.2-2.2,4.9-2.2h33.9C54.8,31.9,55.8,32.1,55.8,33z M20.2,28.1c-2.8,0-6.2,1.5-8,3.7l-8,9.5V15.5c0-1.6,1.3-2.9,3-2.9h10 c1.7,0,3,1.3,3,2.9v1.9c0,1.6,1.3,2.9,3,2.9h18c1.7,0,3,1.3,3,2.9v4.8H20.2z M59.8,33c0-0.7-0.2-1.4-0.5-2.1 c-0.9-1.9-3.1-2.9-5.2-2.9h-6v-4.8c0-3.7-3.1-6.8-7-6.8h-17v-1c0-3.7-3.1-6.8-7-6.8h-10c-3.8,0-7,3.1-7,6.8v29c0,3.7,3.1,6.8,7,6.8 h33.9c2.8,0,6.2-1.6,8-3.7l9.2-11C59.2,35.6,59.8,34.3,59.8,33z"/>
      </svg>
    );
  }
}

FolderOpenOutlined.defaultProps = {
  className: ''
};
