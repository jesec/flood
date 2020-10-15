import React from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';

import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import RTorrentConnectionSettingsForm from './RTorrentConnectionSettingsForm';
import {FormRow, Select, SelectItem} from '../../../ui';

const getClientSelectItems = (): React.ReactNodeArray => {
  return [
    <SelectItem key="rTorrent" id="rTorrent">
      <FormattedMessage id="connection.settings.rtorrent" />
    </SelectItem>,
  ];
};

interface ClientConnectionSettingsFormStates {
  client: ClientConnectionSettings['client'];
}

class ClientConnectionSettingsForm extends React.Component<WrappedComponentProps, ClientConnectionSettingsFormStates> {
  settingsRef: React.RefObject<RTorrentConnectionSettingsForm> = React.createRef();

  constructor(props: WrappedComponentProps) {
    super(props);

    // Only rTorrent is supported at this moment.
    this.state = {
      client: 'rTorrent',
    };
  }

  getConnectionSettings(): ClientConnectionSettings | null {
    if (this.settingsRef.current == null) {
      return null;
    }

    return this.settingsRef.current.getConnectionSettings();
  }

  render() {
    const {intl} = this.props;
    const {client} = this.state;

    let settingsForm: React.ReactNode = null;
    switch (client) {
      case 'rTorrent':
        settingsForm = <RTorrentConnectionSettingsForm intl={intl} ref={this.settingsRef} />;
        break;
      default:
        break;
    }

    return (
      <div>
        <FormRow>
          <Select
            id="client"
            label={intl.formatMessage({id: 'connection.settings.client.select'})}
            onSelect={(selectedClient) => {
              this.setState({client: selectedClient as ClientConnectionSettings['client']});
            }}>
            {getClientSelectItems()}
          </Select>
        </FormRow>
        {settingsForm}
      </div>
    );
  }
}

export type ClientConnectionSettingsFormType = ClientConnectionSettingsForm;

export default injectIntl(ClientConnectionSettingsForm, {forwardRef: true});
