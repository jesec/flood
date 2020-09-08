import React from 'react';

import BaseIcon from './BaseIcon';

export default class FolderClosedOutline extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--folder ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M48.71,23.45a6.49,6.49,0,0,0-6.37-6.55H23.23V16a6.49,6.49,0,0,0-6.37-6.55H7.76A6.49,6.49,0,0,0,1.39,16V44a6.49,6.49,0,0,0,6.37,6.55H42.34A6.49,6.49,0,0,0,48.71,44V23.45Z" />
      </svg>
    );
  }
}
