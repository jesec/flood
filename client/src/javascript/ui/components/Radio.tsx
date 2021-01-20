import {FC} from 'react';

import {Circle} from '@client/ui/icons';

import ToggleInput, {ToggleInputProps} from './ToggleInput';

type RadioProps = Omit<ToggleInputProps, 'icon' | 'id' | 'type' | 'value'> & {
  id: Required<ToggleInputProps['id']>;
  groupID: Required<ToggleInputProps['groupID']>;
};

const Radio: FC<RadioProps> = (props: RadioProps) => {
  const {groupID, id} = props;
  return <ToggleInput {...props} icon={<Circle />} id={groupID} type="radio" value={id} />;
};

export default Radio;
