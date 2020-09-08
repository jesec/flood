import classnames from 'classnames';
import React, {Component} from 'react';

interface FormElementAddonProps {
  addonPlacement?: 'before' | 'after';
  addonIndex?: number;
  className?: string;
  isInteractive?: boolean;
  type?: 'icon';
  onClick?: React.HTMLAttributes<HTMLDivElement>['onClick'];
}

export default class FormElementAddon extends Component<FormElementAddonProps> {
  static defaultProps = {
    type: 'icon',
    isInteractive: false,
  };

  render() {
    const classes = classnames(
      'form__element__addon',
      {
        [`form__element__addon--placed-${this.props.addonPlacement}`]: this.props.addonPlacement,
        [`form__element__addon--index-${this.props.addonIndex}`]: this.props.addonIndex,
        'form__element__addon--is-interactive': this.props.isInteractive || this.props.onClick,
        'form__element__addon--is-icon': this.props.type === 'icon',
      },
      this.props.className,
    );

    return (
      <div className={classes} onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}
