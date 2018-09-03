import {injectIntl} from 'react-intl';
import React, {PureComponent} from 'react';

import ModalActions from '../ModalActions';
import SettingsStore from '../../../stores/SettingsStore';

class AddTorrentsActions extends PureComponent {
  getActions() {
    return [
      {
        checked: SettingsStore.getFloodSettings('startTorrentsOnLoad'),
        clickHandler: this.handleStartTorrentsToggle,
        content: this.props.intl.formatMessage({
          id: 'torrents.add.start.label',
          defaultMessage: 'Start Torrent',
        }),
        id: 'start',
        triggerDismiss: false,
        type: 'checkbox',
      },
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
          defaultMessage: 'Cancel',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        clickHandler: this.props.onAddTorrentsClick,
        content: this.props.intl.formatMessage({
          id: 'torrents.add.button.add',
          defaultMessage: 'Add Torrent',
        }),
        isLoading: this.props.isAddingTorrents,
        submit: true,
        triggerDismiss: false,
        type: 'primary',
      },
    ];
  }

  render() {
    return <ModalActions actions={this.getActions()} dismiss={this.props.dismiss} />;
  }
}

export default injectIntl(AddTorrentsActions);
