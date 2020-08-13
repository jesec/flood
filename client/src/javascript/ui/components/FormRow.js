import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

class FormRow extends Component {
  static propTypes = {
    align: PropTypes.oneOf(['start', 'center', 'end']),
    justify: PropTypes.oneOf(['start', 'center', 'end']),
    children: PropTypes.node,
    wrap: PropTypes.bool,
  };

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
