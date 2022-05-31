import {FC} from 'react';
import {useLingui} from '@lingui/react';

import AddTorrentsByCreation from './AddTorrentsByCreation';
import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from '../Modal';
import SettingStore from '../../../stores/SettingStore';
import UIStore from '../../../stores/UIStore';

const AddTorrentsModal: FC = () => {
  const {i18n} = useLingui();

  const tabs = {
    'by-url': {
      content: AddTorrentsByURL,
      label: i18n._('torrents.add.tab.url.title'),
    },
    'by-file': {
      content: AddTorrentsByFile,
      label: i18n._('torrents.add.tab.file.title'),
    },
    'by-creation': {
      content: AddTorrentsByCreation,
      label: i18n._('torrents.add.tab.create.title'),
    },
  };

  if (UIStore.activeModal?.id !== 'add-torrents') {
    return null;
  }

  return (
    <Modal
      heading={i18n._('torrents.add.heading')}
      tabs={tabs}
      initialTabId={UIStore.activeModal.tab ?? SettingStore.floodSettings.UITorrentsAddTab ?? 'by-url'}
    />
  );
};

export default AddTorrentsModal;
