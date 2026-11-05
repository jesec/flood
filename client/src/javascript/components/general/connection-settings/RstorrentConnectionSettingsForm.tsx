import {FC, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormError, FormGroup, FormRow, FormRowGroup, Radio, Textbox} from '@client/ui';

import type {
  RstorrentConnectionSettings,
  RstorrentGRPCTCPConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';

export interface RstorrentConnectionSettingsProps {
  onSettingsChange: (settings: RstorrentConnectionSettings | null) => void;
}

const RstorrentConnectionSettingsForm: FC<RstorrentConnectionSettingsProps> = ({
  onSettingsChange,
}: RstorrentConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [type, setType] = useState<'tcp' | 'socket'>('socket');
  const [settings, setSettings] = useState<RstorrentConnectionSettings | null>(null);

  const handleFormChange = (field: 'host' | 'port' | 'socket', value: string | number): void => {
    let newSettings: RstorrentConnectionSettings | null = null;

    if (field === 'host' || field === 'port') {
      newSettings = {
        client: 'rstorrent',
        type: 'grpc',
        version: 1,
        host: (settings as RstorrentGRPCTCPConnectionSettings)?.host ?? '',
        port: (settings as RstorrentGRPCTCPConnectionSettings)?.port ?? 50051,
        ...{[field]: value},
      };
    }

    if (field === 'socket') {
      newSettings = {
        client: 'rstorrent',
        type: 'grpcSocket',
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
          <FormRow>
            <FormError>{i18n._('connection.settings.rstorrent.notice')}</FormError>
          </FormRow>
          <FormGroup label={i18n._('connection.settings.rstorrent.type')}>
            <FormRow>
              <Radio
                onClick={() => {
                  setType('socket');
                }}
                groupID="type"
                id="rstorrent-socket"
                grow={false}
                defaultChecked={type === 'socket'}
              >
                <Trans id="connection.settings.rstorrent.type.socket" />
              </Radio>
              <Radio
                onClick={() => {
                  setType('tcp');
                }}
                groupID="type"
                id="rstorrent-tcp"
                grow={false}
                defaultChecked={type === 'tcp'}
              >
                <Trans id="connection.settings.rstorrent.type.tcp" />
              </Radio>
            </FormRow>
          </FormGroup>
        </FormRow>
        {type === 'tcp' ? (
          <FormRowGroup>
            <FormRow>
              <FormError>{i18n._('connection.settings.rstorrent.type.tcp.warning')}</FormError>
            </FormRow>
            <FormRow>
              <Textbox
                onChange={(e) => handleFormChange('host', e.target.value)}
                id="host"
                label={<Trans id="connection.settings.rstorrent.host" />}
                placeholder={i18n._('connection.settings.rstorrent.host.input.placeholder')}
              />
              <Textbox
                onChange={(e) => handleFormChange('port', Number(e.target.value))}
                id="port"
                label={<Trans id="connection.settings.rstorrent.port" />}
                placeholder={i18n._('connection.settings.rstorrent.port.input.placeholder')}
              />
            </FormRow>
          </FormRowGroup>
        ) : (
          <FormRow>
            <Textbox
              onChange={(e) => handleFormChange('socket', e.target.value)}
              id="socket"
              label={<Trans id="connection.settings.rstorrent.socket" />}
              placeholder={i18n._('connection.settings.rstorrent.socket.input.placeholder')}
            />
          </FormRow>
        )}
      </FormGroup>
    </FormRow>
  );
};

export default RstorrentConnectionSettingsForm;
