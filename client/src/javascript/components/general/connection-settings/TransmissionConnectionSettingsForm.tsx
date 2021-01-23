import {FC, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {FormGroup, FormRow, Textbox} from '@client/ui';

import type {TransmissionConnectionSettings} from '@shared/schema/ClientConnectionSettings';

export interface TransmissionConnectionSettingsProps {
  onSettingsChange: (settings: TransmissionConnectionSettings | null) => void;
}

const TransmissionConnectionSettingsForm: FC<TransmissionConnectionSettingsProps> = ({
  onSettingsChange,
}: TransmissionConnectionSettingsProps) => {
  const intl = useIntl();
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
            label={<FormattedMessage id="connection.settings.transmission.url" />}
            placeholder={intl.formatMessage({
              id: 'connection.settings.transmission.url.input.placeholder',
            })}
          />
        </FormRow>
        <FormRow>
          <Textbox
            onChange={(e) => handleFormChange('username', e.target.value)}
            id="transmission-username"
            label={<FormattedMessage id="connection.settings.transmission.username" />}
            placeholder={intl.formatMessage({
              id: 'connection.settings.transmission.username.input.placeholder',
            })}
            autoComplete="off"
          />
          <Textbox
            onChange={(e) => handleFormChange('password', e.target.value)}
            id="transmission-password"
            label={<FormattedMessage id="connection.settings.transmission.password" />}
            placeholder={intl.formatMessage({
              id: 'connection.settings.transmission.password.input.placeholder',
            })}
            autoComplete="off"
            type="password"
          />
        </FormRow>
      </FormGroup>
    </FormRow>
  );
};

export default TransmissionConnectionSettingsForm;
