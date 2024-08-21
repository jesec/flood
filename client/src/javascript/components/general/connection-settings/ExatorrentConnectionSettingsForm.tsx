import {FC, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormGroup, FormRow, FormRowGroup, Textbox} from '@client/ui';

import type {ExatorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';

export interface ExatorrentConnectionSettingsProps {
  onSettingsChange: (settings: ExatorrentConnectionSettings | null) => void;
}

const ExatorrentConnectionSettingsForm: FC<ExatorrentConnectionSettingsProps> = ({
  onSettingsChange,
}: ExatorrentConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [settings, setSettings] = useState<ExatorrentConnectionSettings>({
    client: 'exatorrent',
    type: 'tcp',
    host: '127.0.0.1',
    port: 5000,
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
              label={<Trans id="connection.settings.exatorrent.host" />}
              placeholder={i18n._('connection.settings.exatorrent.host.input.placeholder')}
            />
            <Textbox
              onChange={(e) => handleFormChange('port', Number(e.target.value))}
              id="port"
              label={<Trans id="connection.settings.exatorrent.port" />}
              placeholder={i18n._('connection.settings.exatorrent.port.input.placeholder')}
            />
          </FormRow>
        </FormRowGroup>
        <FormRowGroup>
          <FormRow>
            <Textbox
              onChange={(e) => handleFormChange('username', e.target.value)}
              id="exatorrent-username"
              label={<Trans id="connection.settings.exatorrent.username" />}
              placeholder={i18n._('connection.settings.exatorrent.username.input.placeholder')}
              autoComplete="off"
            />
            <Textbox
              onChange={(e) => handleFormChange('password', e.target.value)}
              id="exatorrent-password"
              label={<Trans id="connection.settings.exatorrent.password" />}
              placeholder={i18n._('connection.settings.exatorrent.password.input.placeholder')}
              autoComplete="off"
              type="password"
            />
          </FormRow>
        </FormRowGroup>
      </FormGroup>
    </FormRow>
  );
};

export default ExatorrentConnectionSettingsForm;
