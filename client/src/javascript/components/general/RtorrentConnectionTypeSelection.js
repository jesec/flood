import {FormGroup, FormRow, Radio, Textbox} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

class RtorrentConnectionTypeSelection extends Component {
  static propTypes = {
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {},
  };

  state = {
    connectionType: 'tcp',
  };

  handleTypeChange = event => {
    if (this.state.connectionType !== event.target.value) {
      this.setState({connectionType: event.target.value});
    }

    this.props.onChange(event.target.value);
  };

  renderConnectionOptions() {
    if (this.state.connectionType === 'tcp') {
      return (
        <FormRow>
          <Textbox
            id="rtorrentHost"
            label={<FormattedMessage id="auth.rtorrentHost" defaultMessage="rTorrent Host" />}
            placeholder={this.props.intl.formatMessage({
              id: 'auth.rtorrentHost',
              defaultMessage: 'rTorrent Host',
            })}
          />
          <Textbox
            id="rtorrentPort"
            label={<FormattedMessage id="auth.rtorrentPort" defaultMessage="rTorrent Port" />}
            placeholder={this.props.intl.formatMessage({
              id: 'auth.rtorrentPort',
              defaultMessage: 'rTorrent Port',
            })}
          />
        </FormRow>
      );
    }

    return (
      <FormRow>
        <Textbox
          id="rtorrentSocketPath"
          label={<FormattedMessage id="auth.rtorrentSocket" defaultMessage="rTorrent Socket" />}
          placeholder={this.props.intl.formatMessage({
            id: 'auth.rtorrentSocketPath',
            defaultMessage: 'rTorrent Socket Path',
          })}
        />
      </FormRow>
    );
  }

  render() {
    return (
      <FormRow>
        <FormGroup>
          <FormRow>
            <FormGroup
              label={this.props.intl.formatMessage({
                id: 'auth.connectionType',
                defaultMessage: 'rTorrent Connection Type',
              })}>
              <FormRow>
                <Radio
                  onChange={this.handleTypeChange}
                  groupID="connectionType"
                  id="tcp"
                  grow={false}
                  checked={this.state.connectionType === 'tcp'}>
                  <FormattedMessage id="auth.connectionType.tcp" defaultMessage="TCP" />
                </Radio>
                <Radio
                  onChange={this.handleTypeChange}
                  groupID="connectionType"
                  id="socket"
                  grow={false}
                  checked={this.state.connectionType === 'socket'}>
                  <FormattedMessage id="auth.connectionType.socket" defaultMessage="Unix Socket" />
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

export default injectIntl(RtorrentConnectionTypeSelection);
