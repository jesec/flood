import {FormattedMessage, IntlShape} from 'react-intl';
import React, {Component} from 'react';

import type {QBittorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import {FormGroup, FormRow, Textbox} from '../../../ui';

export interface QBittorrentConnectionSettingsProps {
  intl: IntlShape;
}

export interface QBittorrentConnectionSettingsFormData {
  url: string;
  username: string;
  password: string;
}

class QBittorrentConnectionSettingsForm extends Component<
  QBittorrentConnectionSettingsProps,
  QBittorrentConnectionSettingsFormData
> {
  constructor(props: QBittorrentConnectionSettingsProps) {
    super(props);
    this.getConnectionSettings = this.getConnectionSettings.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);

    this.state = {
      url: '',
      username: '',
      password: '',
    };
  }

  getConnectionSettings(): QBittorrentConnectionSettings | null {
    if (this.state.url == null || this.state.url === '') {
      return null;
    }

    const settings: QBittorrentConnectionSettings = {
      client: 'qBittorrent',
      type: 'web',
      version: 1,
      url: this.state.url,
      username: this.state.username || '',
      password: this.state.password || '',
    };

    return settings;
  }

  handleFormChange(
    event: React.MouseEvent<HTMLInputElement> | KeyboardEvent | React.ChangeEvent<HTMLInputElement>,
    field: keyof QBittorrentConnectionSettingsFormData,
  ) {
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
  }

  render() {
    return (
      <FormRow>
        <FormGroup>
          <FormRow>
            <Textbox
              onChange={(e) => this.handleFormChange(e, 'url')}
              id="url"
              label={<FormattedMessage id="connection.settings.qbittorrent.url" />}
              placeholder={this.props.intl.formatMessage({
                id: 'connection.settings.qbittorrent.url.input.placeholder',
              })}
            />
          </FormRow>
          <FormRow>
            <Textbox
              onChange={(e) => this.handleFormChange(e, 'username')}
              id="qbt-username"
              label={<FormattedMessage id="connection.settings.qbittorrent.username" />}
              placeholder={this.props.intl.formatMessage({
                id: 'connection.settings.qbittorrent.username.input.placeholder',
              })}
              autoComplete="off"
            />
            <Textbox
              onChange={(e) => this.handleFormChange(e, 'password')}
              id="qbt-password"
              label={<FormattedMessage id="connection.settings.qbittorrent.password" />}
              placeholder={this.props.intl.formatMessage({
                id: 'connection.settings.qbittorrent.password.input.placeholder',
              })}
              autoComplete="off"
              type="password"
            />
          </FormRow>
        </FormGroup>
      </FormRow>
    );
  }
}

export default QBittorrentConnectionSettingsForm;
