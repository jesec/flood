import React, {Component} from 'react';

import Checkmark from '../icons/Checkmark';
import ToggleInput from './ToggleInput';

import type {ToggleInputProps} from './ToggleInput';

type CheckboxProps = Omit<ToggleInputProps, 'type' | 'icon'>;

class Checkbox extends Component<CheckboxProps> {
  render() {
    return <ToggleInput {...this.props} type="checkbox" icon={<Checkmark />} />;
  }
}

export default Checkbox;
