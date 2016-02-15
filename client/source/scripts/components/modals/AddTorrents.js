import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import Modal from './Modal';
import TextboxRepeater from '../forms/TextboxRepeater';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = ['onAddTorrentSuccess'];

export default class AddTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      addTorrentsError: null,
      destination: null,
      isExpanded: false,
      isAddingTorrents: false,
      urlTextboxes: [{value: null}]
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_ADD_TORRENT_SUCCESS, this.onAddTorrentSuccess);
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_ADD_TORRENT_SUCCESS, this.onAddTorrentSuccess);
    UIStore.fetchLatestTorrentLocation();
  }

  dismissModal() {
    UIActions.dismissModal();
  }

  onAddTorrentError() {
    this.setState({
      addTorrentsError: 'There was an error, but I have no idea what happened!',
      isAddingTorrents: false
    });
  }

  onAddTorrentSuccess() {
    this.dismissModal();
  }

  getActions() {
    let icon = null;
    let primaryButtonText = 'Add Torrent';

    if (this.state.isAddingTorrents) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = 'Adding...';
    }

    return [
      {
        clickHandler: null,
        content: 'Cancel',
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.handleAddTorrents,
        content: (
          <span>
            {icon}
            {primaryButtonText}
          </span>
        ),
        supplementalClassName: icon != null ? 'has-icon' : '',
        triggerDismiss: true,
        type: 'primary'
      }
    ];
  }

  getAddByFileContent() {
    return <span>add by file</span>;
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
      <Modal heading="Add Torrents"
        actions={this.getActions()}
        dismiss={this.dismissModal}
        tabs={tabs} />
    );
  }
}
