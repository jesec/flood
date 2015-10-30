import React from 'react';

import AddTorrent from './AddTorrent';
import Icon from '../icons/Icon';
import UIActions from '../../actions/UIActions';

export default class Modal extends React.Component {

  constructor() {
    super();
  }

  handleModalClick(event) {
    event.stopPropagation();
  }

  handleOverlayClick() {
    UIActions.dismissModals();
  }

  render() {
    let modal = null;

    switch (this.props.type) {
      case 'torrent-add':
        modal = <AddTorrent clickHandler={this._onModalClick} />;
        break;
    }

    if (modal) {
      return (
        <div className="modal" onClick={this._onOverlayClick}>
          {modal}
        </div>
      );
    } else {
      return null;
    }

  }

}
