import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from '../Modal';

export interface AddTorrentsModalProps extends WrappedComponentProps {
  initialURLs?: Array<{id: number; value: string}>;
}

class AddTorrentsModal extends React.Component<AddTorrentsModalProps> {
  render() {
    const tabs = {
      'by-url': {
        content: AddTorrentsByURL,
        label: this.props.intl.formatMessage({
          id: 'torrents.add.tab.url.title',
        }),
        props: this.props,
      },
      'by-file': {
        content: AddTorrentsByFile,
        label: this.props.intl.formatMessage({
          id: 'torrents.add.tab.file.title',
        }),
      },
    };

    return (
      <Modal
        heading={this.props.intl.formatMessage({
          id: 'torrents.add.heading',
        })}
        tabs={tabs}
      />
    );
  }
}

export default injectIntl(AddTorrentsModal);
