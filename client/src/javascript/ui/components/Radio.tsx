import React, {Component} from 'react';

import Circle from '../icons/Circle';
import ToggleInput from './ToggleInput';

import type {ToggleInputProps} from './ToggleInput';

type RadioProps = Omit<ToggleInputProps, 'icon' | 'id' | 'type' | 'value'> & {
  id: Required<ToggleInputProps['id']>;
  groupID: Required<ToggleInputProps['groupID']>;
};

class Radio extends Component<RadioProps> {
  render() {
    return <ToggleInput {...this.props} icon={<Circle />} id={this.props.groupID} type="radio" value={this.props.id} />;
  }
}

export default Radio;
