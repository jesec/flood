import classnames from 'classnames';
import React, {PureComponent} from 'react';

import FormRowItem from './FormRowItem';

interface FormErrorProps {
  isLoading?: boolean;
}

class FormError extends PureComponent<FormErrorProps> {
  render() {
    // Maybe add some classes later.
    const classes = classnames('form__element error', {
      'error--is-loading': this.props.isLoading,
    });

    return (
      <FormRowItem className={classes} type="error">
        {this.props.children}
      </FormRowItem>
    );
  }
}

export default FormError;
