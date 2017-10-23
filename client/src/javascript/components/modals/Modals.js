import _ from 'lodash';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import AddTorrentsModal from './add-torrents-modal/AddTorrentsModal';
import ConfirmModal from './confirm-modal/ConfirmModal';
import EventTypes from '../../constants/EventTypes';
import FeedsModal from './feeds-modal/FeedsModal';
import MoveTorrentsModal from './move-torrents-modal/MoveTorrentsModal';
import RemoveTorrentsModal from './remove-torrents-modal/RemoveTorrentsModal';
import SetTagsModal from './set-tags-modal/SetTagsModal';
import SettingsModal from './settings-modal/SettingsModal';
import TorrentDetailsModal from './torrent-details-modal/TorrentDetailsModal';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'handleKeyPress',
  'handleOverlayClick',
  'onModalChange'
];

export default class Modals extends React.Component {
  constructor() {
    super();

    this.modals = {
      'add-torrents': AddTorrentsModal,
      confirm: ConfirmModal,
      feeds: FeedsModal,
      'move-torrents': MoveTorrentsModal,
      'remove-torrents': RemoveTorrentsModal,
      'set-taxonomy': SetTagsModal,
      settings: SettingsModal,
      'torrent-details': TorrentDetailsModal
    };

    this.state = {
      activeModal: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.handleKeyPress = _.throttle(this.handleKeyPress, 1000);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
    UIStore.listen(EventTypes.UI_MODAL_CHANGE, this.onModalChange);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
    UIStore.unlisten(EventTypes.UI_MODAL_CHANGE, this.onModalChange);
  }

  dismissModal() {
    UIActions.dismissModal();
  }

  getModal() {
    let ActiveModal = this.modals[this.state.activeModal.id];

    return (
      <ActiveModal dismiss={this.dismissModal}
        options={this.state.activeModal.options} />
    );
  }

  handleKeyPress(event) {
    if (this.state.activeModal != null && event.keyCode === 27) {
      this.dismissModal();
    }
  }

  handleModalClick(event) {
    event.stopPropagation();
  }

  handleOverlayClick() {
    this.dismissModal();
  }

  onModalChange() {
    this.setState({activeModal: UIStore.getActiveModal()});
  }

  render() {
    let modal;

    if (this.state.activeModal != null) {
      modal = (
        <div key={this.state.activeModal.id} className="modal">
          <div className="modal__overlay" onClick={this.handleOverlayClick} />
          {this.getModal()}
        </div>
      );
    }

    return (
      <CSSTransitionGroup
        transitionName="modal__animation"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        {modal}
      </CSSTransitionGroup>
    );
  }
}
