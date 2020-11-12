import {FC} from 'react';
import {useIntl} from 'react-intl';

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
  const intl = useIntl();
  return (
    <ModalActions
      actions={[
        {
          checked: Boolean(SettingStore.floodSettings.startTorrentsOnLoad),
          clickHandler: null,
          content: intl.formatMessage({
            id: 'torrents.add.start.label',
          }),
          id: 'start',
          triggerDismiss: false,
          type: 'checkbox',
        },
        {
          clickHandler: null,
          content: intl.formatMessage({
            id: 'button.cancel',
          }),
          triggerDismiss: true,
          type: 'tertiary',
        },
        {
          clickHandler: onAddTorrentsClick,
          content: intl.formatMessage({
            id: 'torrents.add.button.add',
          }),
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
