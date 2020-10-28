import classnames from 'classnames';
import * as React from 'react';

import FormElementAddon from './FormElementAddon';
import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

type TextboxProps = Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'placeholder' | 'onChange' | 'onClick' | 'autoComplete'
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

export default class Textbox extends React.Component<TextboxProps> {
  static defaultProps = {
    type: 'text',
  };

  getLabel(): React.ReactNode {
    const {id, label} = this.props;

    if (label) {
      return (
        <label className="form__element__label" htmlFor={id}>
          {label}
        </label>
      );
    }
    return undefined;
  }

  render() {
    const {
      children,
      id,
      addonPlacement,
      labelOffset,
      wrapperClassName,
      width,
      defaultValue,
      placeholder,
      autoComplete,
      type,
      setRef,
      onChange,
      onClick,
    } = this.props;

    let addonCount = 0;
    const childElements = React.Children.map(children, (child) => {
      const childAsElement = child as React.ReactElement;
      if (childAsElement && childAsElement.type === FormElementAddon) {
        addonCount += 1;
        return React.cloneElement(childAsElement, {
          addonIndex: addonCount,
          addonPlacement,
        });
      }

      return child;
    });

    const inputClasses = classnames('input input--text form__element', {
      [`form__element--has-addon--placed-${addonPlacement}`]: addonPlacement && children,
      [`form__element--has-addon--count-${addonCount}`]: addonCount > 0,
      'form__element--label-offset': labelOffset,
    });
    const wrapperClasses = classnames('form__element__wrapper', wrapperClassName);

    return (
      <FormRowItem width={width}>
        {this.getLabel()}
        <div className={wrapperClasses}>
          <input
            className={inputClasses}
            defaultValue={defaultValue}
            placeholder={placeholder}
            name={id}
            onChange={onChange}
            onClick={onClick}
            ref={setRef}
            tabIndex={0}
            type={type}
            autoComplete={autoComplete}
          />
          {childElements}
        </div>
      </FormRowItem>
    );
  }
}
