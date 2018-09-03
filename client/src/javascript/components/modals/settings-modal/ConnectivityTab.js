import {Checkbox, Form, FormRow, Textbox} from 'flood-ui-kit';
import {FormattedMessage} from 'react-intl';
import React from 'react';

import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsTab from './SettingsTab';

export default class ConnectivityTab extends SettingsTab {
  state = {};

  getDHTEnabledValue() {
    if (this.state.dhtEnabled != null) {
      return this.state.dhtEnabled;
    }

    return this.props.settings.dhtStats.dht === 'auto';
  }

  handleFormChange = ({event, formData}) => {
    if (event.target.name === 'dhtEnabled') {
      const dhtEnabled = !this.getDHTEnabledValue();
      const dhtEnabledString = dhtEnabled ? 'auto' : 'disable';

      this.setState({dhtEnabled});
      this.props.onCustomSettingsChange({
        id: 'dht',
        data: [dhtEnabledString],
        overrideID: 'dhtStats',
        overrideData: {dht: dhtEnabledString},
      });
    } else {
      this.handleClientSettingFieldChange(event.target.name, event);
    }
  };

  render() {
    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader>
          <FormattedMessage defaultMessage="Incoming Connections" id="settings.connectivity.incoming.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('networkPortRange')}
            id="networkPortRange"
            label={
              <FormattedMessage id="settings.connectivity.port.range.label" defaultMessage="Listening Port Range" />
            }
            width="one-quarter"
          />
          <Checkbox
            checked={this.getFieldValue('networkPortRandom') === '1'}
            grow={false}
            id="networkPortRandom"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.port.randomize.label" defaultMessage="Randomize Port" />
          </Checkbox>
          <Checkbox
            checked={this.getFieldValue('networkPortOpen') === '1'}
            grow={false}
            id="networkPortOpen"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.port.open.label" defaultMessage="Open Port" />
          </Checkbox>
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('networkLocalAddress')}
            id="networkLocalAddress"
            label={
              <FormattedMessage id="settings.connectivity.ip.hostname.label" defaultMessage="Reported IP/Hostname" />
            }
          />
          <Textbox
            defaultValue={this.getFieldValue('networkHttpMaxOpen')}
            id="networkHttpMaxOpen"
            label={
              <FormattedMessage
                id="settings.connectivity.max.http.connections"
                defaultMessage="Maximum HTTP Connections"
              />
            }
          />
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.connectivity.dpd.heading" defaultMessage="Decentralized Peer Discovery" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('dhtPort')}
            id="dhtPort"
            label={<FormattedMessage id="settings.connectivity.dht.port.label" defaultMessage="DHT Port" />}
            width="one-quarter"
          />
          <Checkbox checked={this.getDHTEnabledValue()} grow={false} id="dhtEnabled" labelOffset matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.dht.label" defaultMessage="Enable DHT" />
          </Checkbox>
          <Checkbox
            checked={this.getFieldValue('protocolPex') === '1'}
            grow={false}
            id="protocolPex"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.peer.exchange.label" defaultMessage="Enable Peer Exchange" />
          </Checkbox>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.connectivity.peers.heading" defaultMessage="Peers" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleMinPeersNormal')}
            id="throttleMinPeersNormal"
            label={<FormattedMessage id="settings.connectivity.peers.min.label" defaultMessage="Minimum Peers" />}
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxPeersNormal')}
            id="throttleMaxPeersNormal"
            label={<FormattedMessage id="settings.connectivity.peers.max.label" defaultMessage="Maxmimum Peers" />}
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleMinPeersSeed')}
            id="throttleMinPeersSeed"
            label={
              <FormattedMessage
                id="settings.connectivity.peers.seeding.min.label"
                defaultMessage="Minimum Peers Seeding"
              />
            }
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxPeersSeed')}
            id="throttleMaxPeersSeed"
            label={
              <FormattedMessage
                id="settings.connectivity.peers.seeding.max.label"
                defaultMessage="Maxmimum Peers Seeding"
              />
            }
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('trackersNumWant')}
            id="trackersNumWant"
            label={<FormattedMessage id="settings.connectivity.peers.desired.label" defaultMessage="Peers Desired" />}
            width="one-half"
          />
        </FormRow>
      </Form>
    );
  }
}
