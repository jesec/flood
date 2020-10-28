import * as React from 'react';

import Checkmark from '../icons/Checkmark';
import ToggleInput from './ToggleInput';

import type {ToggleInputProps} from './ToggleInput';

type CheckboxProps = Omit<ToggleInputProps, 'type' | 'icon'>;

const Checkbox: React.FC<CheckboxProps> = (props: CheckboxProps) => {
  return <ToggleInput {...props} type="checkbox" icon={<Checkmark />} />;
};

export default Checkbox;
