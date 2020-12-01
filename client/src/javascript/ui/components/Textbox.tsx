import classnames from 'classnames';
import {Children, cloneElement, forwardRef, ReactElement} from 'react';

import FormElementAddon from './FormElementAddon';
import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

type TextboxProps = Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'children' | 'disabled' | 'defaultValue' | 'placeholder' | 'readOnly' | 'onChange' | 'onClick' | 'autoComplete'
> & {
  id: string;
  label?: React.ReactNode;
  type?: 'text' | 'password';
  width?: FormRowItemProps['width'];
  addonPlacement?: 'before' | 'after';
  labelOffset?: boolean;
  wrapperClassName?: string;
};

const Textbox = forwardRef<HTMLInputElement, TextboxProps>(
  (
    {
      children,
      id,
      label,
      addonPlacement,
      labelOffset,
      wrapperClassName,
      width,
      defaultValue,
      placeholder,
      autoComplete,
      type,
      disabled,
      readOnly,
      onChange,
      onClick,
    }: TextboxProps,
    ref,
  ) => {
    let addonCount = 0;
    const childElements = Children.map(children, (child) => {
      const childAsElement = child as ReactElement;
      if (childAsElement && childAsElement.type === FormElementAddon) {
        addonCount += 1;
        return cloneElement(childAsElement, {
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
        {label != null ? (
          <label className="form__element__label" htmlFor={id}>
            {label}
          </label>
        ) : undefined}
        <div className={wrapperClasses}>
          <input
            className={inputClasses}
            defaultValue={defaultValue}
            placeholder={placeholder}
            name={id}
            onChange={onChange}
            onClick={onClick}
            ref={ref}
            tabIndex={0}
            type={type}
            autoComplete={autoComplete}
            disabled={disabled}
            readOnly={readOnly}
          />
          {childElements}
        </div>
      </FormRowItem>
    );
  },
);

Textbox.defaultProps = {
  label: undefined,
  type: 'text',
  width: undefined,
  addonPlacement: undefined,
  labelOffset: undefined,
  wrapperClassName: undefined,
};

export default Textbox;
