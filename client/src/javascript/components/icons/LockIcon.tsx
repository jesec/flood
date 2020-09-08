import React from 'react';

import BaseIcon from './BaseIcon';

export default class LockIcon extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--lock ${this.props.className}`} viewBox={this.getViewBox()}>
        <path
          d="M9.917 27.364h1.305v-7.91C11.222 9.322 19.464 1 29.5 1c10.036 0 18.278 8.321 18.278 18.455v7.909H9.917zm9.139 0h20.888v-7.91c0-5.808-4.691-10.545-10.444-10.545-5.753 0-10.444 4.737-10.444 10.546v7.909z"
          fillOpacity=".4"
        />
        <path d="M6 27.364h46.819V59H6z" />
      </svg>
    );
  }
}
