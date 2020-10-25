import {injectIntl, WrappedComponentProps} from 'react-intl';
import React, {PureComponent} from 'react';

import ModalActions from '../ModalActions';
import SettingStore from '../../../stores/SettingStore';

import type {ModalAction} from '../../../stores/UIStore';

interface AddTorrentsActionsProps extends WrappedComponentProps {
  isAddingTorrents: boolean;
  onAddTorrentsClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

class AddTorrentsActions extends PureComponent<AddTorrentsActionsProps> {
  getActions(): Array<ModalAction> {
    return [
      {
        checked: Boolean(SettingStore.floodSettings.startTorrentsOnLoad),
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
