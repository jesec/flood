import {CSSTransition, TransitionGroup} from 'react-transition-group';
import React from 'react';
import throttle from 'lodash/throttle';

import AddTorrentsModal from './add-torrents-modal/AddTorrentsModal';
import ConfirmModal from './confirm-modal/ConfirmModal';
import connectStores from '../../util/connectStores';
import EventTypes from '../../constants/EventTypes';
import FeedsModal from './feeds-modal/FeedsModal';
import MoveTorrentsModal from './move-torrents-modal/MoveTorrentsModal';
import RemoveTorrentsModal from './remove-torrents-modal/RemoveTorrentsModal';
import SetTagsModal from './set-tags-modal/SetTagsModal';
import SetTrackerModal from './set-tracker-modal/SetTrackerModal';
import SettingsModal from './settings-modal/SettingsModal';
import TorrentDetailsModal from './torrent-details-modal/TorrentDetailsModal';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

import type {Modal} from '../../stores/UIStore';

interface ModalsProps {
  activeModal?: Modal | null;
}

const createModal = (id: Modal['id'], options: Modal['options']): React.ReactNode => {
  switch (id) {
    case 'add-torrents':
      return <AddTorrentsModal />;
    case 'confirm':
      return <ConfirmModal options={options as ConfirmModal['props']['options']} />;
    case 'feeds':
      return <FeedsModal />;
    case 'move-torrents':
      return <MoveTorrentsModal />;
    case 'remove-torrents':
      return <RemoveTorrentsModal />;
    case 'set-taxonomy':
      return <SetTagsModal />;
    case 'set-tracker':
      return <SetTrackerModal />;
    case 'settings':
      return <SettingsModal />;
    case 'torrent-details':
      return <TorrentDetailsModal options={options} />;
    default:
      return null;
  }
};

const dismissModal = () => {
  UIActions.dismissModal();
};

class Modals extends React.Component<ModalsProps> {
  constructor(props: ModalsProps) {
    super(props);

    this.handleKeyPress = throttle(this.handleKeyPress, 1000);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  }

  handleKeyPress = (event: KeyboardEvent) => {
    if (this.props.activeModal != null && event.keyCode === 27) {
      dismissModal();
    }
  };

  handleOverlayClick = () => {
    dismissModal();
  };

  render() {
    let modal;

    if (this.props.activeModal != null) {
      modal = (
        <CSSTransition key={this.props.activeModal.id} classNames="modal__animation" timeout={{enter: 500, exit: 500}}>
          <div className="modal">
            <div className="modal__overlay" onClick={this.handleOverlayClick} />
            {createModal(this.props.activeModal.id, this.props.activeModal.options)}
          </div>
        </CSSTransition>
      );
    }

    return <TransitionGroup>{modal}</TransitionGroup>;
  }
}

const ConnectedModals = connectStores(Modals, () => {
  return [
    {
      store: UIStore,
      event: EventTypes.UI_MODAL_CHANGE,
      getValue: () => {
        return {
          activeModal: UIStore.getActiveModal(),
        };
      },
    },
  ];
});

export default ConnectedModals;
