import {FC} from 'react';
import {useIntl} from 'react-intl';

import AddTorrentsByCreation from './AddTorrentsByCreation';
import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from '../Modal';
import SettingStore from '../../../stores/SettingStore';
import UIStore from '../../../stores/UIStore';

const AddTorrentsModal: FC = () => {
  const intl = useIntl();

  const tabs = {
    'by-url': {
      content: AddTorrentsByURL,
      label: intl.formatMessage({
        id: 'torrents.add.tab.url.title',
      }),
    },
    'by-file': {
      content: AddTorrentsByFile,
      label: intl.formatMessage({
        id: 'torrents.add.tab.file.title',
      }),
    },
    'by-creation': {
      content: AddTorrentsByCreation,
      label: intl.formatMessage({
        id: 'torrents.add.tab.create.title',
      }),
    },
  };

  if (UIStore.activeModal?.id !== 'add-torrents') {
    return null;
  }

  let initialTabId: keyof typeof tabs = 'by-url';
  if (!UIStore.activeModal.initialURLs?.length) {
    initialTabId = SettingStore.floodSettings.UITorrentsAddTab ?? initialTabId;
  }

  return (
    <Modal
      heading={intl.formatMessage({
        id: 'torrents.add.heading',
      })}
      tabs={tabs}
      initialTabId={initialTabId}
    />
  );
};

export default AddTorrentsModal;
