import _ from 'lodash';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import AddTorrents from './AddTorrents';
import ConfirmModal from './ConfirmModal';
import EventTypes from '../../constants/EventTypes';
import Modal from './Modal';
import MoveTorrents from './MoveTorrents';
import SettingsModal from './SettingsModal';
import TorrentDetailsModal from './TorrentDetailsModal';
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
      confirm: ConfirmModal,
      'move-torrents': MoveTorrents,
      'add-torrents': AddTorrents,
      'torrent-details': TorrentDetailsModal,
      'settings': SettingsModal
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
        <div key={this.state.activeModal.id} className="modal modal-overlay"
          onClick={this.handleOverlayClick}>
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
