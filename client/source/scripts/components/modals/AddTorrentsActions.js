import React from 'react';

import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import ModalActions from './ModalActions';

export default class AddTorrents extends React.Component {
  getActions() {
    let icon = null;
    let primaryButtonText = 'Add Torrent';

    if (this.props.isAddingTorrents) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = 'Adding...';
    }

    return [
      {
        checked: true,
        clickHandler: this.props.onStartTorrentsToggle,
        content: 'Start Torrent',
        triggerDismiss: false,
        type: 'checkbox'
      },
      {
        clickHandler: null,
        content: 'Cancel',
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.props.onAddTorrentsClick,
        content: (
          <span>
            {icon}
            {primaryButtonText}
          </span>
        ),
        supplementalClassName: icon != null ? 'has-icon' : '',
        triggerDismiss: false,
        type: 'primary'
      }
    ];
  }

  render() {
    return (
      <ModalActions actions={this.getActions()} dismiss={this.props.dismiss} />
    );
  }
}
