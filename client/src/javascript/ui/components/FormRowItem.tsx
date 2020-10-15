import classnames from 'classnames';
import React from 'react';

export interface FormRowItemProps {
  children: React.ReactNode;

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

const FormRowItem: React.FC<FormRowItemProps> = ({
  children,
  className,
  type,
  width,
  grow,
  shrink,
}: FormRowItemProps) => {
  const classes = classnames('form__row__item', className, {
    [`form__row__item--${width}`]: width,
    'form__row__item--grow': grow,
    'form__row__item--shrink': shrink,
    'form__row__item--error': type === 'error',
  });

  return <div className={classes}>{children}</div>;
};

FormRowItem.defaultProps = {
  grow: true,
  shrink: true,
  width: 'auto',
};

export default FormRowItem;
