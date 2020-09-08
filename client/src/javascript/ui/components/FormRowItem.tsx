import classnames from 'classnames';
import React, {Component} from 'react';

export interface FormRowItemProps {
  className?: string;
  type?: string;

  grow?: boolean;
  shrink?: boolean;
  width?:
    | 'auto'
    | 'one-eighth'
    | 'one-quarter'
    | 'three-eighths'
    | 'one-half'
    | 'five-eighths'
    | 'three-quarters'
    | 'seven-eighths';
}

class FormRowItem extends Component<FormRowItemProps> {
  static defaultProps = {
    grow: true,
    shrink: true,
    width: 'auto',
  };

  render() {
    const classes = classnames('form__row__item', this.props.className, {
      [`form__row__item--${this.props.width}`]: this.props.width,
      'form__row__item--grow': this.props.grow,
      'form__row__item--shrink': this.props.shrink,
      'form__row__item--error': this.props.type === 'error',
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default FormRowItem;
