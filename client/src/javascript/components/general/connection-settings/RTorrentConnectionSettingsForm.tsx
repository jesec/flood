import {FC, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {FormError, FormGroup, FormRow, FormRowGroup, Radio, Textbox} from '@client/ui';

import type {RTorrentConnectionSettings, RTorrentTCPConnectionSettings} from '@shared/schema/ClientConnectionSettings';

export interface RTorrentConnectionSettingsProps {
  onSettingsChange: (settings: RTorrentConnectionSettings | null) => void;
}

const RTorrentConnectionSettingsForm: FC<RTorrentConnectionSettingsProps> = ({
  onSettingsChange,
}: RTorrentConnectionSettingsProps) => {
  const intl = useIntl();
  const [type, setType] = useState<'tcp' | 'socket'>('socket');
  const [settings, setSettings] = useState<RTorrentConnectionSettings | null>(null);

  const handleFormChange = (field: 'host' | 'port' | 'socket', value: string | number): void => {
    let newSettings: RTorrentConnectionSettings | null = null;

    if (field === 'host' || field === 'port') {
      newSettings = {
        client: 'rTorrent',
        type: 'tcp',
        version: 1,
        host: (settings as RTorrentTCPConnectionSettings)?.host ?? '',
        port: (settings as RTorrentTCPConnectionSettings)?.port ?? 5000,
        ...{[field]: value},
      };
    }

    if (field === 'socket') {
      newSettings = {
        client: 'rTorrent',
        type: 'socket',
        version: 1,
        socket: value as string,
      };
    }

    onSettingsChange(newSettings);
    setSettings(newSettings);
  };

  return (
    <FormRow>
      <FormGroup>
        <FormRow>
          <FormGroup
            label={intl.formatMessage({
              id: 'connection.settings.rtorrent.type',
            })}>
            <FormRow>
              <Radio
                onClick={() => {
                  setType('socket');
                }}
                groupID="type"
                id="socket"
                grow={false}
                defaultChecked={type === 'socket'}>
                <FormattedMessage id="connection.settings.rtorrent.type.socket" />
              </Radio>
              <Radio
                onClick={() => {
                  setType('tcp');
                }}
                groupID="type"
                id="tcp"
                grow={false}
                defaultChecked={type === 'tcp'}>
                <FormattedMessage id="connection.settings.rtorrent.type.tcp" />
              </Radio>
            </FormRow>
          </FormGroup>
        </FormRow>
        {type === 'tcp' ? (
          <FormRowGroup>
            <FormRow>
              <FormError>
                {intl.formatMessage({
                  id: 'connection.settings.rtorrent.type.tcp.warning',
                })}
              </FormError>
            </FormRow>
            <FormRow>
              <Textbox
                onChange={(e) => handleFormChange('host', e.target.value)}
                id="host"
                label={<FormattedMessage id="connection.settings.rtorrent.host" />}
                placeholder={intl.formatMessage({
                  id: 'connection.settings.rtorrent.host.input.placeholder',
                })}
              />
              <Textbox
                onChange={(e) => handleFormChange('port', Number(e.target.value))}
                id="port"
                label={<FormattedMessage id="connection.settings.rtorrent.port" />}
                placeholder={intl.formatMessage({
                  id: 'connection.settings.rtorrent.port.input.placeholder',
                })}
              />
            </FormRow>
          </FormRowGroup>
        ) : (
          <FormRow>
            <Textbox
              onChange={(e) => handleFormChange('socket', e.target.value)}
              id="socket"
              label={<FormattedMessage id="connection.settings.rtorrent.socket" />}
              placeholder={intl.formatMessage({
                id: 'connection.settings.rtorrent.socket.input.placeholder',
              })}
            />
          </FormRow>
        )}
      </FormGroup>
    </FormRow>
  );
};

export default RTorrentConnectionSettingsForm;
