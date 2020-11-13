import {FC} from 'react';
import {useIntl} from 'react-intl';

import AddTorrentsByCreation from './AddTorrentsByCreation';
import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from '../Modal';
import SettingStore from '../../../stores/SettingStore';

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

  return (
    <Modal
      heading={intl.formatMessage({
        id: 'torrents.add.heading',
      })}
      tabs={tabs}
      initialTabId={SettingStore.floodSettings.UITorrentsAddTab}
    />
  );
};

export default AddTorrentsModal;
