import classnames from 'classnames';
import React, {Component} from 'react';

import FormElementAddon from './FormElementAddon';
import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

type TextboxProps = Pick<
  React.HTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'placeholder' | 'onChange' | 'onClick'
> & {
  id: string;
  label?: React.ReactNode;
  type?: 'text' | 'password';
  width?: FormRowItemProps['width'];
  setRef?: React.Ref<HTMLInputElement>;
  addonPlacement?: 'before' | 'after';
  labelOffset?: boolean;
  wrapperClassName?: string;
};

export default class Textbox extends Component<TextboxProps> {
  static defaultProps = {
    type: 'text',
  };

  getLabel(): React.ReactNode {
    if (this.props.label) {
      return (
        <label className="form__element__label" htmlFor={this.props.id}>
          {this.props.label}
        </label>
      );
    }
    return undefined;
  }

  render() {
    let addonCount = 0;
    const children = React.Children.map(this.props.children, (child) => {
      const childAsElement = child as React.ReactElement;
      if (childAsElement && childAsElement.type === FormElementAddon) {
        addonCount += 1;
        return React.cloneElement(childAsElement, {
          addonIndex: addonCount,
          addonPlacement: this.props.addonPlacement,
        });
      }

      return child;
    });

    const inputClasses = classnames('input input--text form__element', {
      [`form__element--has-addon--placed-${this.props.addonPlacement}`]:
        this.props.addonPlacement && this.props.children,
      [`form__element--has-addon--count-${addonCount}`]: addonCount > 0,
      'form__element--label-offset': this.props.labelOffset,
    });
    const wrapperClasses = classnames('form__element__wrapper', this.props.wrapperClassName);

    return (
      <FormRowItem width={this.props.width}>
        {this.getLabel()}
        <div className={wrapperClasses}>
          <input
            className={inputClasses}
            defaultValue={this.props.defaultValue}
            placeholder={this.props.placeholder}
            name={this.props.id}
            onChange={this.props.onChange}
            onClick={this.props.onClick}
            ref={this.props.setRef}
            tabIndex={0}
            type={this.props.type}
          />
          {children}
        </div>
      </FormRowItem>
    );
  }
}
