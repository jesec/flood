import {FC} from 'react';
import {useIntl} from 'react-intl';

import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from '../Modal';
import AddTorrentsByCreation from './AddTorrentsByCreation';

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
    />
  );
};

export default AddTorrentsModal;
