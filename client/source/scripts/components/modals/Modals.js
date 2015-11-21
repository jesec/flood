import {connect} from 'react-redux';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import AddTorrents from './AddTorrents';
import {dismissModal} from '../../actions/UIActions';
import Icon from '../icons/Icon';
import uiSelector from '../../selectors/uiSelector';

const methodsToBind = [
  'handleOverlayClick'
];

class Modal extends React.Component {

  constructor() {
    super();

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleModalClick(event) {
    event.stopPropagation();
  }

  handleOverlayClick() {
    this.props.dispatch(dismissModal());
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.modal !== this.props.modal) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    let modal = null;

    switch (this.props.modal) {
      case 'add-torrents':
        modal = (
          <AddTorrents clickHandler={this.onModalClick}
            dismissModal={this.handleOverlayClick}
            dispatch={this.props.dispatch} />
        );
        break;
    }

    if (modal !== null) {
      modal = (
        <div className="modal" onClick={this.handleOverlayClick}>
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

export default connect(uiSelector)(Modal);
