import React, {Component} from 'react';

import Checkmark from '../icons/Checkmark';
import ToggleInput from './ToggleInput';

class Checkbox extends Component {
  render() {
    return <ToggleInput {...this.props} type="checkbox" icon={<Checkmark />} />;
  }
}

export default Checkbox;
