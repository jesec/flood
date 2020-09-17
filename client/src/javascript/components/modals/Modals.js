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

class Modals extends React.Component {
  constructor() {
    super();

    this.modals = {
      'add-torrents': AddTorrentsModal,
      confirm: ConfirmModal,
      feeds: FeedsModal,
      'move-torrents': MoveTorrentsModal,
      'remove-torrents': RemoveTorrentsModal,
      'set-taxonomy': SetTagsModal,
      'set-tracker': SetTrackerModal,
      settings: SettingsModal,
      'torrent-details': TorrentDetailsModal,
    };

    this.handleKeyPress = throttle(this.handleKeyPress, 1000);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  }

  dismissModal() {
    UIActions.dismissModal();
  }

  getModal() {
    const ActiveModal = this.modals[this.props.activeModal.id];

    return <ActiveModal dismiss={this.dismissModal} options={this.props.activeModal.options} />;
  }

  handleKeyPress = (event) => {
    if (this.props.activeModal != null && event.keyCode === 27) {
      this.dismissModal();
    }
  };

  handleModalClick(event) {
    event.stopPropagation();
  }

  handleOverlayClick = () => {
    this.dismissModal();
  };

  render() {
    let modal;

    if (this.props.activeModal != null) {
      modal = (
        <CSSTransition key={this.props.activeModal.id} classNames="modal__animation" timeout={{enter: 500, exit: 500}}>
          <div className="modal">
            <div className="modal__overlay" onClick={this.handleOverlayClick} />
            {this.getModal()}
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
      getValue: ({store}) => {
        return {
          activeModal: store.getActiveModal(),
        };
      },
    },
  ];
});

export default ConnectedModals;
