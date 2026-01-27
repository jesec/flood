import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface FormRowProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
  wrap?: boolean;
}

const FormRow: FC<FormRowProps> = ({children, align = 'start', justify = 'start', wrap = false}: FormRowProps) => {
  const classes = classnames('form__row', {
    'form__row--wrap': wrap,
    [`form__row--justify--${justify}`]: justify,
    [`form__row--align--${align}`]: align,
  });

  return <div className={classes}>{children}</div>;
};

export default FormRow;
