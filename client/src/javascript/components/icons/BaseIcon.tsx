import {Component} from 'react';

interface BaseIconProps {
  className?: string;
  size?: string;
  viewBox?: string;
}

export default class BaseIcon extends Component<BaseIconProps> {
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
