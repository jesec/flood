import classnames from 'classnames';
import React from 'react';

interface FormRowProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
  wrap?: boolean;
}

const FormRow: React.FC<FormRowProps> = ({children, align, justify, wrap}: FormRowProps) => {
  const classes = classnames('form__row', {
    'form__row--wrap': wrap,
    [`form__row--justify--${justify}`]: justify,
    [`form__row--align--${align}`]: align,
  });

  return <div className={classes}>{children}</div>;
};

FormRow.defaultProps = {
  align: 'start',
  justify: 'start',
  wrap: false,
};

export default FormRow;
