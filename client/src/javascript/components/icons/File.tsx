import React from 'react';

import BaseIcon from './BaseIcon';

export default class File extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--file ${this.props.className}`} viewBox={this.getViewBox()}>
        <g style={{transform: 'translate(8px, 0)'}}>
          <path d="M48.14,19.89V56a3,3,0,0,1-3,3H3a3,3,0,0,1-3-3V5.84a3,3,0,0,1,3-3H31.09A8.41,8.41,0,0,1,36.23,5L46,14.75A8.4,8.4,0,0,1,48.14,19.89Zm-4,3h-13a3,3,0,0,1-3-3v-13H4V55H44.13V22.89Zm-12-4H43.88a4,4,0,0,0-.69-1.29L33.38,7.79a4,4,0,0,0-1.28-.69V18.88Z" />
        </g>
      </svg>
    );
  }
}
