import PropTypes from 'prop-types';
import React from 'react';

export default class BaseIcon extends React.Component {
  static propTypes = {
    size: PropTypes.string,
    viewBox: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    viewBox: '0 0 60 60',
  };

  getViewBox() {
    let {viewBox} = this.props;

    if (this.props.size && this.props.size === 'mini') {
      viewBox = '0 0 8 8';
    }

    return viewBox;
  }
}
