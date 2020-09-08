import classnames from 'classnames';
import React, {Component} from 'react';

interface FormRowProps {
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
  wrap?: boolean;
}

class FormRow extends Component<FormRowProps> {
  render() {
    const classes = classnames('form__row', {
      'form__row--wrap': this.props.wrap,
      [`form__row--justify--${this.props.justify}`]: this.props.justify,
      [`form__row--align--${this.props.align}`]: this.props.align,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default FormRow;
