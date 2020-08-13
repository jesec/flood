import {FormattedMessage, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {FormGroup, FormRow, Radio, Textbox} from '../../ui';

class RtorrentConnectionTypeSelection extends Component {
  static propTypes = {
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {
      // do nothing.
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      connectionType: 'tcp',
    };
  }

  handleTypeChange = (event) => {
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
            label={<FormattedMessage id="auth.rtorrentHost" />}
            placeholder={this.props.intl.formatMessage({
              id: 'auth.rtorrentHost',
            })}
          />
          <Textbox
            id="rtorrentPort"
            label={<FormattedMessage id="auth.rtorrentPort" />}
            placeholder={this.props.intl.formatMessage({
              id: 'auth.rtorrentPort',
            })}
          />
        </FormRow>
      );
    }

    return (
      <FormRow>
        <Textbox
          id="rtorrentSocketPath"
          label={<FormattedMessage id="auth.rtorrentSocket" />}
          placeholder={this.props.intl.formatMessage({
            id: 'auth.rtorrentSocketPath',
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
              })}>
              <FormRow>
                <Radio
                  onChange={this.handleTypeChange}
                  groupID="connectionType"
                  id="tcp"
                  grow={false}
                  checked={this.state.connectionType === 'tcp'}>
                  <FormattedMessage id="auth.connectionType.tcp" />
                </Radio>
                <Radio
                  onChange={this.handleTypeChange}
                  groupID="connectionType"
                  id="socket"
                  grow={false}
                  checked={this.state.connectionType === 'socket'}>
                  <FormattedMessage id="auth.connectionType.socket" />
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
