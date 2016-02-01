import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import AddTorrents from './AddTorrents';
import EventTypes from '../../constants/EventTypes';
import Modal from './Modal';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'handleOverlayClick',
  'onModalChange'
];

export default class Modals extends React.Component {
  constructor() {
    super();

    this.state = {
      activeModal: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    UIStore.listen(EventTypes.UI_MODAL_CHANGE, this.onModalChange);
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.UI_MODAL_CHANGE, this.onModalChange);
  }

  dismissModal() {
    UIActions.dismissModal();
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
    let modal = null;

    let modalOptions = null;
    let modalType = this.state.activeModal;

    if (modalType && modalType.type) {
      modalOptions = modalType;
      modalType = modalType.type;
    }

    switch (modalType) {
      case 'confirm':
        modal = (
          <Modal actions={modalOptions.actions}
            alignment="center"
            content={modalOptions.content}
            dismiss={this.dismissModal}
            heading={modalOptions.heading} />
        );
        break;
      case 'add-torrents':
        modal = (
          <AddTorrents dismissModal={this.handleOverlayClick} />
        );
        break;
    }

    if (modal !== null) {
      modal = (
        <div key={this.state.activeModal} className="modal" onClick={this.handleOverlayClick}>
          {modal}
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
    )

  }
}
