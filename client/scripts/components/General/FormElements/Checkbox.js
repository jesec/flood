import classnames from 'classnames';
import React from 'react';

import Checkmark from '../../Icons/Checkmark';

const METHODS_TO_BIND = ['handleCheckboxChange', 'syncStateWithProps'];

export default class Checkbox extends React.Component {
  constructor() {
    super();

    this.state = {checked: false};

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.syncStateWithProps(this.props, this.state);
  }

  getValue() {
    return this.state.checked;
  }

  handleCheckboxChange(event) {
    let currentCheckedState = this.state.checked;
    let newCheckedState = !currentCheckedState;

    if (!this.props.useProps) {
      this.setState({checked: newCheckedState});
    }

    if (this.props.onChange) {
      this.props.onChange(newCheckedState, event.nativeEvent);
    }
  }

  handleClick(event) {
    event.stopPropagation();
  }

  syncStateWithProps(props, state) {
    if (props.checked != null && state.checked !== props.checked) {
      this.setState({checked: props.checked});
    }
  }

  render() {
    let checked = this.props.useProps ? this.props.checked : this.state.checked;
    let classes = classnames('checkbox', {'is-checked': checked});

    return (
      <label className={classes} onClick={this.handleClick}>
        <input type="checkbox" checked={checked}
          onChange={this.handleCheckboxChange} />
        <span className="checkbox__decoy">
          <Checkmark />
        </span>
        <span className="checkbox__label">
          {this.props.children}
        </span>
      </label>
    );
  }
}

Checkbox.defaultProps = {
  checked: false,
  children: null,
  useProps: false
};
