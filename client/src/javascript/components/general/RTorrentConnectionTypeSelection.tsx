import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React, {Component} from 'react';
import {FormGroup, FormRow, Radio, Textbox} from '../../ui';

interface RTorrentConnectionTypeSelectionProps extends WrappedComponentProps {
  onChange?: (connectionType: RTorrentConnectionTypeSelectionStates['connectionType']) => void;
}

interface RTorrentConnectionTypeSelectionStates {
  connectionType: 'tcp' | 'socket';
}

class RTorrentConnectionTypeSelection extends Component<
  RTorrentConnectionTypeSelectionProps,
  RTorrentConnectionTypeSelectionStates
> {
  constructor(props: RTorrentConnectionTypeSelectionProps) {
    super(props);
    this.state = {
      connectionType: 'tcp',
    };
    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  handleTypeChange(event: React.MouseEvent<HTMLInputElement> | KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement == null) {
      return;
    }

    const connectionType = inputElement.value as RTorrentConnectionTypeSelectionStates['connectionType'];

    if (this.state.connectionType !== connectionType) {
      this.setState({connectionType});
    }

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(connectionType);
    }
  }

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

export default injectIntl(RTorrentConnectionTypeSelection);
