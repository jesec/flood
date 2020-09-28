import {injectIntl, WrappedComponentProps} from 'react-intl';
import React, {PureComponent} from 'react';

import ModalActions from '../ModalActions';
import SettingsStore from '../../../stores/SettingsStore';

interface AddTorrentsActionsProps extends WrappedComponentProps {
  isAddingTorrents: boolean;
  onAddTorrentsClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

class AddTorrentsActions extends PureComponent<AddTorrentsActionsProps> {
  getActions(): ModalActions['props']['actions'] {
    return [
      {
        checked: Boolean(SettingsStore.getFloodSetting('startTorrentsOnLoad')),
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'torrents.add.start.label',
        }),
        id: 'start',
        triggerDismiss: false,
        type: 'checkbox',
      },
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        clickHandler: this.props.onAddTorrentsClick,
        content: this.props.intl.formatMessage({
          id: 'torrents.add.button.add',
        }),
        isLoading: this.props.isAddingTorrents,
        submit: true,
        triggerDismiss: false,
        type: 'primary',
      },
    ];
  }

  render() {
    return <ModalActions actions={this.getActions()} />;
  }
}

export default injectIntl(AddTorrentsActions);
