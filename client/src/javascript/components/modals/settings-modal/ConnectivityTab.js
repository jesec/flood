import {FormattedMessage} from 'react-intl';
import React from 'react';

import {Checkbox, Form, FormRow, Textbox} from '../../../ui';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsTab from './SettingsTab';

export default class ConnectivityTab extends SettingsTab {
  state = {};

  getDHTEnabledValue() {
    return this.props.settings.dhtStats.dht === 'auto' || this.props.settings.dhtStats.dht === 'on';
  }

  handleFormChange = ({event}) => {
    if (event.target.name === 'dhtEnabled') {
      this.props.onClientSettingsChange({dht: event.target.checked ? 'auto' : 'disable'});
      return;
    }

    this.handleClientSettingFieldChange(event.target.name, event);
  };

  render() {
    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.connectivity.incoming.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('networkPortRange')}
            id="networkPortRange"
            label={<FormattedMessage id="settings.connectivity.port.range.label" />}
            width="one-quarter"
          />
          <Checkbox
            checked={this.getFieldValue('networkPortRandom') === '1'}
            grow={false}
            id="networkPortRandom"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.port.randomize.label" />
          </Checkbox>
          <Checkbox
            checked={this.getFieldValue('networkPortOpen') === '1'}
            grow={false}
            id="networkPortOpen"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.port.open.label" />
          </Checkbox>
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('networkLocalAddress')}
            id="networkLocalAddress"
            label={<FormattedMessage id="settings.connectivity.ip.hostname.label" />}
          />
          <Textbox
            defaultValue={this.getFieldValue('networkHttpMaxOpen')}
            id="networkHttpMaxOpen"
            label={<FormattedMessage id="settings.connectivity.max.http.connections" />}
          />
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.connectivity.dpd.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('dhtPort')}
            id="dhtPort"
            label={<FormattedMessage id="settings.connectivity.dht.port.label" />}
            width="one-quarter"
          />
          <Checkbox checked={this.getDHTEnabledValue()} grow={false} id="dhtEnabled" labelOffset matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.dht.label" />
          </Checkbox>
          <Checkbox
            checked={this.getFieldValue('protocolPex') === '1'}
            grow={false}
            id="protocolPex"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.peer.exchange.label" />
          </Checkbox>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.connectivity.peers.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleMinPeersNormal')}
            id="throttleMinPeersNormal"
            label={<FormattedMessage id="settings.connectivity.peers.min.label" />}
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxPeersNormal')}
            id="throttleMaxPeersNormal"
            label={<FormattedMessage id="settings.connectivity.peers.max.label" />}
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleMinPeersSeed')}
            id="throttleMinPeersSeed"
            label={<FormattedMessage id="settings.connectivity.peers.seeding.min.label" />}
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxPeersSeed')}
            id="throttleMaxPeersSeed"
            label={<FormattedMessage id="settings.connectivity.peers.seeding.max.label" />}
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('trackersNumWant')}
            id="trackersNumWant"
            label={<FormattedMessage id="settings.connectivity.peers.desired.label" />}
            width="one-half"
          />
        </FormRow>
      </Form>
    );
  }
}
