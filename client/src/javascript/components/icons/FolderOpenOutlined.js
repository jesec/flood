import React from 'react';

import BaseIcon from './BaseIcon';

export default class FolderOpenOutlined extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--directory-outlined ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M58.55,39.26L49.28,50.67a11.34,11.34,0,0,1-8,3.83H7a7.07,7.07,0,0,1-7-7V17.29a7.07,7.07,0,0,1,7-7H17.1a7.07,7.07,0,0,1,7,7v1h17.1a7.07,7.07,0,0,1,7,7v5h6a5.59,5.59,0,0,1,5.22,3A4.94,4.94,0,0,1,60,35.49,6.18,6.18,0,0,1,58.55,39.26Zm-14.3-8.9v-5a3,3,0,0,0-3-3H23.13a3,3,0,0,1-3-3v-2a3,3,0,0,0-3-3H7a3,3,0,0,0-3,3V44.1l8-9.9a11.22,11.22,0,0,1,8-3.84H44.25Zm10.06,4H20.11a7.25,7.25,0,0,0-4.93,2.33L5.94,48.13a2.19,2.19,0,0,0-.57,1.26c0,0.88,1,1.1,1.67,1.1h34.2a7.15,7.15,0,0,0,4.93-2.36l9.24-11.41A2,2,0,0,0,56,35.49C56,34.61,55,34.39,54.31,34.39Z" />
      </svg>
    );
  }
}
