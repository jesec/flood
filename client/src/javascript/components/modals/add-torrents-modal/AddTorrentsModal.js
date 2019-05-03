import {injectIntl} from 'react-intl';
import React from 'react';

import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from '../Modal';
import UIActions from '../../../actions/UIActions';

class AddTorrents extends React.Component {
  dismissModal() {
    UIActions.dismissModal();
  }

  render() {
    const tabs = {
      'by-url': {
        content: AddTorrentsByURL,
        label: this.props.intl.formatMessage({
          id: 'torrents.add.tab.url.title',
          defaultMessage: 'By URL',
        }),
      },
      'by-file': {
        content: AddTorrentsByFile,
        label: this.props.intl.formatMessage({
          id: 'torrents.add.tab.file.title',
          defaultMessage: 'By File',
        }),
      },
    };

    return (
      <Modal
        heading={this.props.intl.formatMessage({
          id: 'torrents.add.heading',
          defaultMessage: 'Add Torrents',
        })}
        dismiss={this.dismissModal}
        tabs={tabs}
      />
    );
  }
}

export default injectIntl(AddTorrents);
