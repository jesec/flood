import {FC} from 'react';

import {Checkmark} from '@client/ui/icons';

import ToggleInput, {ToggleInputProps} from './ToggleInput';

type CheckboxProps = Omit<ToggleInputProps, 'type' | 'icon'>;

const Checkbox: FC<CheckboxProps> = (props: CheckboxProps) => (
  <ToggleInput {...props} type="checkbox" icon={<Checkmark />} />
);

export default Checkbox;
