import React from 'react';

import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import Modal from './Modal';
import UIActions from '../../actions/UIActions';

export default class AddTorrents extends React.Component {
  dismissModal() {
    UIActions.dismissModal();
  }

  render() {
    let tabs = {
      'by-url': {
        content: <AddTorrentsByURL />,
        label: 'By URL'
      },
      'by-file': {
        content: <AddTorrentsByFile />,
        label: 'By File'
      }
    };

    return (
      <Modal heading="Add Torrents" dismiss={this.dismissModal} tabs={tabs} />
    );
  }
}
