import {FC, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormGroup, FormRow, Textbox} from '@client/ui';

import type {QBittorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';

export interface QBittorrentConnectionSettingsProps {
  onSettingsChange: (settings: QBittorrentConnectionSettings | null) => void;
}

const QBittorrentConnectionSettingsForm: FC<QBittorrentConnectionSettingsProps> = ({
  onSettingsChange,
}: QBittorrentConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [settings, setSettings] = useState<QBittorrentConnectionSettings>({
    client: 'qBittorrent',
    type: 'web',
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
            label={<Trans id="connection.settings.qbittorrent.url" />}
            placeholder={i18n._('connection.settings.qbittorrent.url.input.placeholder')}
          />
        </FormRow>
        <FormRow>
          <Textbox
            onChange={(e) => handleFormChange('username', e.target.value)}
            id="qbt-username"
            label={<Trans id="connection.settings.qbittorrent.username" />}
            placeholder={i18n._('connection.settings.qbittorrent.username.input.placeholder')}
            autoComplete="off"
          />
          <Textbox
            onChange={(e) => handleFormChange('password', e.target.value)}
            id="qbt-password"
            label={<Trans id="connection.settings.qbittorrent.password" />}
            placeholder={i18n._('connection.settings.qbittorrent.password.input.placeholder')}
            autoComplete="off"
            type="password"
          />
        </FormRow>
      </FormGroup>
    </FormRow>
  );
};

export default QBittorrentConnectionSettingsForm;
