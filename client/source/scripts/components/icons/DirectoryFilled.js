import React from 'react';

import BaseIcon from './BaseIcon';

export default class DirectoryOutlined extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--directory-filled ${this.props.className}`}
        xmlns={this.getXmlns} viewBox={this.getViewBox()}>
        <path d="M56.6,33.3c0-1.2-1.4-1.5-2.5-1.5H23.3c-2.5,0-5.8,1.5-7.5,3.3L6.4,45.8c-0.5,0.5-0.9,1.1-0.9,1.8c0,1.2,1.4,1.5,2.5,1.5 h30.8c2.5,0,5.8-1.5,7.5-3.3l9.5-10.8C56.2,34.6,56.6,33.9,56.6,33.3z M46.9,23.9c0-3.3-2.9-6.1-6.3-6.1H25.1V17 c0-3.3-2.9-6.1-6.3-6.1H9.8c-3.5,0-6.3,2.7-6.3,6.1V43c0,0.2,0,0.5,0,0.7l0.1-0.2l9.5-10.8c2.3-2.6,6.7-4.5,10.2-4.5h23.5V23.9z"/>
      </svg>
    );
  }
}

DirectoryOutlined.defaultProps = {
  className: ''
};
