import {useIntl} from 'react-intl';
import React from 'react';

import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from '../Modal';
import AddTorrentsByCreation from './AddTorrentsByCreation';

export interface AddTorrentsModalProps {
  initialURLs?: Array<{id: number; value: string}>;
}

const AddTorrentsModal: React.FC<AddTorrentsModalProps> = (props: AddTorrentsModalProps) => {
  const {initialURLs} = props;
  const intl = useIntl();

  const tabs = {
    'by-url': {
      content: AddTorrentsByURL,
      label: intl.formatMessage({
        id: 'torrents.add.tab.url.title',
      }),
      props: {initialURLs},
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
