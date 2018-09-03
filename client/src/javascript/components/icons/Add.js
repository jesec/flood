import React from 'react';

import BaseIcon from './BaseIcon';

export default class AddMini extends BaseIcon {
  render() {
    return (
      <svg className={`icon icon--add ${this.props.className}`} viewBox={this.getViewBox()}>
        <path d="M53.7 25.3h-19v-19h-9.4v19h-19v9.4h19v19h9.4v-19h19" />
      </svg>
    );
  }
}
