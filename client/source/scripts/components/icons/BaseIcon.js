import React from 'react';

export default class BaseIcon extends React.Component {
  getViewBox() {
    let viewBox = this.props.viewBox;

    if (this.props.size && this.props.size === 'mini') {
      viewBox = '0 0 8 8';
    }

    return viewBox;
  }

  getXmlns() {
    return 'http://www.w3.org/2000/svg';
  }
}

BaseIcon.defaultProps = {
  className: '',
  what: 'hello',
  viewBox: '0 0 60 60'
};

BaseIcon.propTypes = {
  className: React.PropTypes.string,
  size: React.PropTypes.string,
  viewBox: React.PropTypes.string
};
