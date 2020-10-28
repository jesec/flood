import {FormattedMessage, IntlShape} from 'react-intl';
import * as React from 'react';

import type {
  RTorrentConnectionSettings,
  RTorrentSocketConnectionSettings,
  RTorrentTCPConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';

import {FormGroup, FormRow, Radio, Textbox} from '../../../ui';

export interface RTorrentConnectionSettingsProps {
  intl: IntlShape;
}

export interface RTorrentConnectionSettingsFormData {
  type?: string;
  socket?: string;
  host?: string;
  port?: string;
}

class RTorrentConnectionSettingsForm extends React.Component<
  RTorrentConnectionSettingsProps,
  RTorrentConnectionSettingsFormData
> {
  constructor(props: RTorrentConnectionSettingsProps) {
    super(props);
    this.state = {
      type: 'tcp',
    };
  }

  getConnectionSettings = (): RTorrentConnectionSettings | null => {
    const {type, socket, host, port} = this.state;

    switch (type) {
      case 'socket': {
        if (socket == null) {
          return null;
        }
        const settings: RTorrentSocketConnectionSettings = {
          client: 'rTorrent',
          type: 'socket',
          version: 1,
          socket,
        };
        return settings;
      }
      case 'tcp': {
        const portAsNumber = Number(port);
        if (host == null || portAsNumber == null) {
          return null;
        }
        const settings: RTorrentTCPConnectionSettings = {
          client: 'rTorrent',
          type: 'tcp',
          version: 1,
          host,
          port: portAsNumber,
        };
        return settings;
      }
      default:
        return null;
    }
  };

  handleFormChange = (
    event: React.MouseEvent<HTMLInputElement> | KeyboardEvent | React.ChangeEvent<HTMLInputElement>,
    field: keyof RTorrentConnectionSettingsFormData,
  ) => {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement == null) {
      return;
    }

    const {value} = inputElement;

    if (this.state[field] !== value) {
      this.setState((prev) => {
        return {
          ...prev,
          [field]: value,
        };
      });
    }
  };

  renderConnectionOptions() {
    const {intl} = this.props;
    const {type} = this.state;

    if (type === 'tcp') {
      return (
        <FormRow>
          <Textbox
            onChange={(e) => this.handleFormChange(e, 'host')}
            id="host"
            label={<FormattedMessage id="connection.settings.rtorrent.host" />}
            placeholder={intl.formatMessage({
              id: 'connection.settings.rtorrent.host.input.placeholder',
            })}
          />
          <Textbox
            onChange={(e) => this.handleFormChange(e, 'port')}
            id="port"
            label={<FormattedMessage id="connection.settings.rtorrent.port" />}
            placeholder={intl.formatMessage({
              id: 'connection.settings.rtorrent.port.input.placeholder',
            })}
          />
        </FormRow>
      );
    }

    return (
      <FormRow>
        <Textbox
          onChange={(e) => this.handleFormChange(e, 'socket')}
          id="socket"
          label={<FormattedMessage id="connection.settings.rtorrent.socket" />}
          placeholder={intl.formatMessage({
            id: 'connection.settings.rtorrent.socket.input.placeholder',
          })}
        />
      </FormRow>
    );
  }

  render() {
    const {intl} = this.props;
    const {type} = this.state;

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
                  onChange={(e) => this.handleFormChange(e, 'type')}
                  groupID="type"
                  id="tcp"
                  grow={false}
                  checked={type === 'tcp'}>
                  <FormattedMessage id="connection.settings.rtorrent.type.tcp" />
                </Radio>
                <Radio
                  onChange={(e) => this.handleFormChange(e, 'type')}
                  groupID="type"
                  id="socket"
                  grow={false}
                  checked={type === 'socket'}>
                  <FormattedMessage id="connection.settings.rtorrent.type.socket" />
                </Radio>
              </FormRow>
            </FormGroup>
          </FormRow>
          {this.renderConnectionOptions()}
        </FormGroup>
      </FormRow>
    );
  }
}

export default RTorrentConnectionSettingsForm;
