import classnames from 'classnames';
import React from 'react';

import Checkbox from './Checkbox';
import RadioDot from '../../Icons/RadioDot';

const METHODS_TO_BIND = ['handleChange'];

class Radio extends Checkbox {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleChange(event) {
    let newCheckedState = !this.state.checked;

    if (!this.props.useProps) {
      this.setState({checked: newCheckedState});
    }

    if (this.props.onChange) {
      this.props.onChange(
        {name: this.props.name, checked: newCheckedState}, event.nativeEvent
      );
    }
  }

  render() {
    let checked = this.props.useProps ? this.props.checked : this.state.checked;
    let classes = classnames('radio', {'is-checked': checked});

    return (
      <label className={classes} onClick={this.handleClick}>
        <input type="radio" checked={checked}
          onChange={this.handleChange} />
        <span className="radio__decoy">
          <RadioDot />
        </span>
        <span className="radio__label">
          {this.props.children}
        </span>
      </label>
    );
  }
}

Radio.defaultProps = {
  checked: false,
  children: null,
  useProps: false
};

export default Radio;
