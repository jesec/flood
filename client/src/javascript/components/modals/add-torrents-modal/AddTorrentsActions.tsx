import {FC} from 'react';
import {useLingui} from '@lingui/react';

import ModalActions from '../ModalActions';
import SettingStore from '../../../stores/SettingStore';

interface AddTorrentsActionsProps {
  isAddingTorrents: boolean;
  onAddTorrentsClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const AddTorrentsActions: FC<AddTorrentsActionsProps> = ({
  isAddingTorrents,
  onAddTorrentsClick,
}: AddTorrentsActionsProps) => {
  const {i18n} = useLingui();
  return (
    <ModalActions
      actions={[
        {
          checked: Boolean(SettingStore.floodSettings.startTorrentsOnLoad),
          clickHandler: null,
          content: i18n._('torrents.add.start.label'),
          id: 'start',
          triggerDismiss: false,
          type: 'checkbox',
        },
        {
          clickHandler: null,
          content: i18n._('button.cancel'),
          triggerDismiss: true,
          type: 'tertiary',
        },
        {
          clickHandler: onAddTorrentsClick,
          content: i18n._('torrents.add.button.add'),
          isLoading: isAddingTorrents,
          submit: true,
          triggerDismiss: false,
          type: 'primary',
        },
      ]}
    />
  );
};

export default AddTorrentsActions;
