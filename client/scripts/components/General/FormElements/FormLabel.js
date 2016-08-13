import classnames from 'classnames';
import React from 'react';

import ErrorIcon from '../../Icons/ErrorIcon';
import Tooltip from '../Tooltip';

class FormLabel extends React.Component {
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

FormLabel.defaultProps = {
  baseClass: 'form__label',
  className: null
};

FormLabel.propTypes = {
  baseClass: React.PropTypes.string,
  className: React.PropTypes.oneOfType([React.PropTypes.string,
    React.PropTypes.array, React.PropTypes.object])
};

export default FormLabel;
