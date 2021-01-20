import {Component, ChangeEvent, MouseEvent} from 'react';
import {FormattedMessage, IntlShape} from 'react-intl';

import {FormError, FormGroup, FormRow, FormRowGroup, Radio, Textbox} from '@client/ui';

import type {
  RTorrentConnectionSettings,
  RTorrentSocketConnectionSettings,
  RTorrentTCPConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';

export interface RTorrentConnectionSettingsProps {
  intl: IntlShape;
}

export interface RTorrentConnectionSettingsFormData {
  type?: string;
  socket?: string;
  host?: string;
  port?: string;
}

class RTorrentConnectionSettingsForm extends Component<
  RTorrentConnectionSettingsProps,
  RTorrentConnectionSettingsFormData
> {
  constructor(props: RTorrentConnectionSettingsProps) {
    super(props);
    this.state = {
      type: 'socket',
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
    event: MouseEvent<HTMLInputElement> | KeyboardEvent | ChangeEvent<HTMLInputElement>,
    field: keyof RTorrentConnectionSettingsFormData,
  ) => {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement == null) {
      return;
    }

    const {value} = inputElement;

    if (this.state[field] !== value) {
      this.setState((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  renderConnectionOptions() {
    const {intl} = this.props;
    const {type} = this.state;

    if (type === 'tcp') {
      return (
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
        </FormRowGroup>
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
                  onClick={(e) => this.handleFormChange(e, 'type')}
                  groupID="type"
                  id="socket"
                  grow={false}
                  defaultChecked={type === 'socket'}>
                  <FormattedMessage id="connection.settings.rtorrent.type.socket" />
                </Radio>
                <Radio
                  onClick={(e) => this.handleFormChange(e, 'type')}
                  groupID="type"
                  id="tcp"
                  grow={false}
                  defaultChecked={type === 'tcp'}>
                  <FormattedMessage id="connection.settings.rtorrent.type.tcp" />
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
