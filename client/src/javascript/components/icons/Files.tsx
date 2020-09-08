import React from 'react';

import BaseIcon from './BaseIcon';

export default class Files extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--files ${this.props.className}`} viewBox={this.getViewBox()}>
        <path
          className="icon--files__file icon--files__file--front"
          d="M44.3,18l-6.38-6.6A5.4,5.4,0,0,0,34.56,10H16.23a2,2,0,0,0-2,2V45.89a2,2,0,0,0,2,2h27.5a2,2,0,0,0,2-2V21.52A5.78,5.78,0,0,0,44.3,18Zm-9.08-5a2.75,2.75,0,0,1,.84.35L42.46,20a5.15,5.15,0,0,1,.24,1H35.22V13Zm8,32.43H16.76V12.5h16l-0.05,9a2,2,0,0,0,2,2H43.2v22Z"
        />
        <path
          className="icon--files__file icon--files__file--right"
          d="M58.85,23.64l-3.73-3.82a3.16,3.16,0,0,0-2-.83H44.94a6.46,6.46,0,0,1,.62,1.57H52v5.1a1.16,1.16,0,0,0,1.15,1.18h5V39.37H45.7v1.57H58.52a1.16,1.16,0,0,0,1.15-1.18V25.65A3.33,3.33,0,0,0,58.85,23.64Zm-5.3,1.62V20.65a1.51,1.51,0,0,1,.49.27l3.74,3.83a1.57,1.57,0,0,1,.26.5H53.55Z"
        />
        <path
          className="icon--files__file icon--files__file--left"
          d="M14.27,39.37H1.83V20.56H11v5.1a1.16,1.16,0,0,0,1.15,1.18h2.12V25.26H12.53V20.65a1.51,1.51,0,0,1,.49.27l1.25,1.28V20l-0.16-.17a3.16,3.16,0,0,0-2-.83H1.44A1.16,1.16,0,0,0,.3,20.16v19.6a1.16,1.16,0,0,0,1.15,1.18H14.27V39.37Z"
        />
      </svg>
    );
  }
}
