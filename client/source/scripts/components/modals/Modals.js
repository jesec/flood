import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import AddTorrents from './AddTorrents';
import EventTypes from '../../constants/EventTypes';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'handleOverlayClick',
  'onModalChange'
];

export default class Modal extends React.Component {
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

  handleModalClick(event) {
    event.stopPropagation();
  }

  handleOverlayClick() {
    UIActions.dismissModal();
  }

  onModalChange() {
    this.setState({activeModal: UIStore.getActiveModal()});
  }

  render() {
    let modal = null;

    switch (this.state.activeModal) {
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
