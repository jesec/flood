import classnames from 'classnames';
import React from 'react';

import Checkmark from '../../Icons/Checkmark';

const METHODS_TO_BIND = ['handleCheckboxChange'];

export default class Checkbox extends React.Component {
  constructor() {
    super();

    this.state = {checked: false};

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (this.props.checked != null
      && this.state.checked !== this.props.checked) {
      this.setState({checked: this.props.checked});
    }
  }

  handleCheckboxChange() {
    let currentCheckedState = this.state.checked;
    let newCheckedState = !currentCheckedState;

    this.setState({checked: newCheckedState});

    if (this.props.onChange) {
      this.props.onChange(newCheckedState);
    }
  }

  render() {
    let classes = classnames('checkbox', {
      'is-checked': this.state.checked
    });

    return (
      <label className={classes}>
        <input type="checkbox" checked={this.state.checked}
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
  checked: false
};
