import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from '../Modal';

class AddTorrents extends React.Component<WrappedComponentProps> {
  render() {
    const tabs = {
      'by-url': {
        content: AddTorrentsByURL,
        label: this.props.intl.formatMessage({
          id: 'torrents.add.tab.url.title',
        }),
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

export default injectIntl(AddTorrents);
