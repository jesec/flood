import classnames from 'classnames';
import React from 'react';

class FormColumn extends React.Component {
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

FormColumn.defaultProps = {
  baseClass: 'form__column',
  errorModifier: 'has-error',
  className: null,
  error: '',
  modifiers: []
};

FormColumn.propTypes = {
  baseClass: React.PropTypes.string,
  className: React.PropTypes.oneOfType([React.PropTypes.string,
    React.PropTypes.array, React.PropTypes.object]),
  errorModifier: React.PropTypes.string,
  error: React.PropTypes.string,
  modifiers: React.PropTypes.arrayOf(React.PropTypes.string)
};

export default FormColumn;
