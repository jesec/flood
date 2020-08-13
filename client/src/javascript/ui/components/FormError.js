import classnames from 'classnames';
import React, {PureComponent} from 'react';

import FormRowItem from './FormRowItem';

class FormError extends PureComponent {
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
