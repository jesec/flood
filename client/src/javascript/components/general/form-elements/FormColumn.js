import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

class FormColumn extends React.Component {
  static propTypes = {
    baseClass: PropTypes.string,
    className: PropTypes.oneOfType([PropTypes.string,
      PropTypes.array, PropTypes.object]),
    errorModifier: PropTypes.string,
    error: PropTypes.string,
    modifiers: PropTypes.arrayOf(PropTypes.string)
  };

  static defaultProps = {
    baseClass: 'form__column',
    errorModifier: 'has-error',
    className: null,
    error: '',
    modifiers: []
  };

  render() {
    let {baseClass, children, classNames, error, errorModifier, modifiers}
      = this.props;
    let classes = classnames(baseClass, classNames,
      {[`${baseClass}--${errorModifier}`]: error},
      modifiers.reduce((memo, modifier) => {
        return `${memo} ${baseClass}--${modifier}`;
      }, '')
    );

    return (
      <div className={classes}>
        {children}
      </div>
    );
  }
}

export default FormColumn;
