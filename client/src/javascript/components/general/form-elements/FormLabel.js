import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ErrorIcon from '../../icons/ErrorIcon';
import Tooltip from '../Tooltip';

class FormLabel extends React.Component {
  static propTypes = {
    baseClass: PropTypes.string,
    className: PropTypes.oneOfType([PropTypes.string,
      PropTypes.array, PropTypes.object]),
    error: PropTypes.string
  };

  static defaultProps = {
    baseClass: 'form__label',
    className: null,
    error: ''
  };

  render() {
    let {baseClass, className, error} = this.props;
    let classes = classnames(baseClass, className);
    let tooltip = null;

    if (error) {
      tooltip = (
        <Tooltip className="tooltip tooltip--is-error" content={error}
          offset={-5}>
          <ErrorIcon />
        </Tooltip>
      );
    }

    return (
      <label className={classes}>
        {this.props.children}
        {tooltip}
      </label>
    );
  }
}

export default FormLabel;
