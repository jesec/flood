import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {observer} from 'mobx-react';
import React from 'react';

import AddTorrentsModal from './add-torrents-modal/AddTorrentsModal';
import ConfirmModal from './confirm-modal/ConfirmModal';
import FeedsModal from './feeds-modal/FeedsModal';
import MoveTorrentsModal from './move-torrents-modal/MoveTorrentsModal';
import RemoveTorrentsModal from './remove-torrents-modal/RemoveTorrentsModal';
import SetTagsModal from './set-tags-modal/SetTagsModal';
import SetTrackersModal from './set-trackers-modal/SetTrackersModal';
import SettingsModal from './settings-modal/SettingsModal';
import TorrentDetailsModal from './torrent-details-modal/TorrentDetailsModal';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

import type {Modal} from '../../stores/UIStore';

const createModal = (id: Modal['id']): React.ReactNode => {
  switch (id) {
    case 'add-torrents':
      return <AddTorrentsModal />;
    case 'confirm':
      return <ConfirmModal />;
    case 'feeds':
      return <FeedsModal />;
    case 'move-torrents':
      return <MoveTorrentsModal />;
    case 'remove-torrents':
      return <RemoveTorrentsModal />;
    case 'set-taxonomy':
      return <SetTagsModal />;
    case 'set-trackers':
      return <SetTrackersModal />;
    case 'settings':
      return <SettingsModal />;
    case 'torrent-details':
      return <TorrentDetailsModal />;
    default:
      return null;
  }
};

const dismissModal = () => {
  UIActions.dismissModal();
};

@observer
class Modals extends React.Component {
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  }

  handleKeyPress = (event: KeyboardEvent) => {
    if (UIStore.activeModal != null && event.key === 'Escape') {
      dismissModal();
    }
  };

  handleOverlayClick = () => {
    dismissModal();
  };

  render() {
    const id = UIStore.activeModal?.id;

    let modal;
    if (id != null) {
      modal = (
        <CSSTransition key={id} classNames="modal__animation" timeout={{enter: 500, exit: 500}}>
          <div className="modal">
            <div className="modal__overlay" onClick={this.handleOverlayClick} />
            {createModal(id)}
          </div>
        </CSSTransition>
      );
    }

    return <TransitionGroup>{modal}</TransitionGroup>;
  }
}

export default Modals;
