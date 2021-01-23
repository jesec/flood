import classnames from 'classnames';
import {FC, ReactNode} from 'react';

import FormRowItem from './FormRowItem';

interface FormErrorProps {
  children: ReactNode;
  isLoading?: boolean;
}

const FormError: FC<FormErrorProps> = ({children, isLoading}: FormErrorProps) => {
  // Maybe add some classes later.
  const classes = classnames('form__element error', {
    'error--is-loading': isLoading,
  });

  return (
    <FormRowItem className={classes} type="error">
      {children}
    </FormRowItem>
  );
};

FormError.defaultProps = {
  isLoading: false,
};

export default FormError;
