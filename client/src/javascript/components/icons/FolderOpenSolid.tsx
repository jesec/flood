import React from 'react';

import BaseIcon from './BaseIcon';

export default class FolderOpenSolid extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--folder ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M58.61,33.58c0-1.3-1.47-1.62-2.51-1.62H21.84a11.36,11.36,0,0,0-7.62,3.52L4.52,46.92a3.09,3.09,0,0,0-.89,1.9c0,1.3,1.47,1.62,2.51,1.62H40.4A11.35,11.35,0,0,0,48,46.92l9.7-11.43A3.09,3.09,0,0,0,58.61,33.58Zm-9.9-10.3a6.49,6.49,0,0,0-6.47-6.47H23.14V15.89a6.49,6.49,0,0,0-6.47-6.46H8a6.49,6.49,0,0,0-6.47,6.46V44c0,0.23,0,.49,0,0.72l0.14-.17,9.73-11.43a15,15,0,0,1,10.42-4.82H48.71v-5Z" />
      </svg>
    );
  }
}
