import {FC, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormGroup, FormRow, Textbox} from '@client/ui';

import type {TransmissionConnectionSettings} from '@shared/schema/ClientConnectionSettings';

export interface TransmissionConnectionSettingsProps {
  onSettingsChange: (settings: TransmissionConnectionSettings | null) => void;
}

const TransmissionConnectionSettingsForm: FC<TransmissionConnectionSettingsProps> = ({
  onSettingsChange,
}: TransmissionConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [settings, setSettings] = useState<TransmissionConnectionSettings>({
    client: 'Transmission',
    type: 'rpc',
    version: 1,
    url: '',
    username: '',
    password: '',
  });

  const handleFormChange = (field: 'url' | 'username' | 'password', value: string): void => {
    const newSettings = {
      ...settings,
      [field]: value,
    };

    if (newSettings.url == null || newSettings.url === '') {
      onSettingsChange(null);
    } else {
      onSettingsChange(newSettings);
    }

    setSettings(newSettings);
  };

  return (
    <FormRow>
      <FormGroup>
        <FormRow>
          <Textbox
            onChange={(e) => handleFormChange('url', e.target.value)}
            id="url"
            label={<Trans id="connection.settings.transmission.url" />}
            placeholder={i18n._('connection.settings.transmission.url.input.placeholder')}
          />
        </FormRow>
        <FormRow>
          <Textbox
            onChange={(e) => handleFormChange('username', e.target.value)}
            id="transmission-username"
            label={<Trans id="connection.settings.transmission.username" />}
            placeholder={i18n._('connection.settings.transmission.username.input.placeholder')}
            autoComplete="off"
          />
          <Textbox
            onChange={(e) => handleFormChange('password', e.target.value)}
            id="transmission-password"
            label={<Trans id="connection.settings.transmission.password" />}
            placeholder={i18n._('connection.settings.transmission.password.input.placeholder')}
            autoComplete="off"
            type="password"
          />
        </FormRow>
      </FormGroup>
    </FormRow>
  );
};

export default TransmissionConnectionSettingsForm;
