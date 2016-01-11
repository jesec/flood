import React from 'react';

export default class BaseIcon extends React.Component {
  getViewBox() {
    let viewBox = '0 0 60 60';

    if (this.props.size && this.props.size === 'mini') {
      viewBox = '0 0 8 8';
    } else if (this.props.viewBox) {
      viewBox = this.props.viewBox;
    }

    return viewBox;
  }

  getXmlns() {
    return 'http://www.w3.org/2000/svg';
  }
}
