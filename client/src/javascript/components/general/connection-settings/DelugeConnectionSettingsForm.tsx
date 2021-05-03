import {FC, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormGroup, FormRow, FormRowGroup, Textbox} from '@client/ui';

import type {DelugeConnectionSettings} from '@shared/schema/ClientConnectionSettings';

export interface DelugeConnectionSettingsProps {
  onSettingsChange: (settings: DelugeConnectionSettings | null) => void;
}

const DelugeConnectionSettingsForm: FC<DelugeConnectionSettingsProps> = ({
  onSettingsChange,
}: DelugeConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [settings, setSettings] = useState<DelugeConnectionSettings>({
    client: 'Deluge',
    type: 'rpc',
    version: 1,
    host: '127.0.0.1',
    port: 58846,
    username: '',
    password: '',
  });

  const handleFormChange = (field: 'host' | 'port' | 'username' | 'password', value: string | number): void => {
    const newSettings = {
      ...settings,
      [field]: value,
    };

    if (!newSettings.host || Number.isNaN(newSettings.port)) {
      onSettingsChange(null);
    } else {
      onSettingsChange(newSettings);
    }

    setSettings(newSettings);
  };

  return (
    <FormRow>
      <FormGroup>
        <FormRowGroup>
          <FormRow>
            <Textbox
              onChange={(e) => handleFormChange('host', e.target.value)}
              id="host"
              label={<Trans id="connection.settings.deluge.host" />}
              placeholder={i18n._('connection.settings.deluge.host.input.placeholder')}
            />
            <Textbox
              onChange={(e) => handleFormChange('port', Number(e.target.value))}
              id="port"
              label={<Trans id="connection.settings.deluge.port" />}
              placeholder={i18n._('connection.settings.deluge.port.input.placeholder')}
            />
          </FormRow>
        </FormRowGroup>
        <FormRowGroup>
          <FormRow>
            <Textbox
              onChange={(e) => handleFormChange('username', e.target.value)}
              id="deluge-username"
              label={<Trans id="connection.settings.deluge.username" />}
              placeholder={i18n._('connection.settings.deluge.username.input.placeholder')}
              autoComplete="off"
            />
            <Textbox
              onChange={(e) => handleFormChange('password', e.target.value)}
              id="deluge-password"
              label={<Trans id="connection.settings.deluge.password" />}
              placeholder={i18n._('connection.settings.deluge.password.input.placeholder')}
              autoComplete="off"
              type="password"
            />
          </FormRow>
        </FormRowGroup>
      </FormGroup>
    </FormRow>
  );
};

export default DelugeConnectionSettingsForm;
