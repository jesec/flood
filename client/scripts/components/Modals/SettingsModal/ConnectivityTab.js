import {FormattedMessage} from 'react-intl';
import _ from 'lodash';
import React from 'react';

import Checkbox from '../../General/FormElements/Checkbox';
import SettingsTab from './SettingsTab';

const METHODS_TO_BIND = ['handleDHTToggle'];

export default class ConnectivityTab extends SettingsTab {
  constructor() {
    super(...arguments);

    this.state = {};

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getDHTEnabledValue() {
    if (this.state.dhtEnabled != null) {
      return this.state.dhtEnabled;
    }

    return this.props.settings.dhtStats.dht === 'auto';
  }

  handleDHTToggle() {
    let dhtEnabled = !this.getDHTEnabledValue();
    let dhtEnabledString = dhtEnabled ? 'auto' : 'disable';

    this.setState({dhtEnabled});
    this.props.onCustomSettingsChange({
      id: 'dht',
      data: [dhtEnabledString],
      overrideID: 'dhtStats',
      overrideData: {dht: dhtEnabledString}
    });
  }

  render() {
    return (
      <div className="form">
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              id="settings.connectivity.incoming.heading"
              defaultMessage="Incoming Connections"
            />
          </div>
          <div className="form__row">
            <div className="form__column form__column--small">
              <label className="form__label">
                <FormattedMessage
                  id="settings.connectivity.port.range.label"
                  defaultMessage="Listening Port Range"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'networkPortRange')}
                value={this.getFieldValue('networkPortRange')} />
            </div>
            <div className="form__column form__column--auto form__column--unlabled">
              <Checkbox
                checked={this.getFieldValue('networkPortRandom') === '1'}
                onChange={this.handleClientSettingCheckboxChange.bind(this, 'networkPortRandom')}>
                <FormattedMessage
                  id="settings.connectivity.port.randomize.label"
                  defaultMessage="Randomize Port"
                />
              </Checkbox>
            </div>
            <div className="form__column form__column--auto form__column--unlabled">
              <Checkbox
                checked={this.getFieldValue('networkPortOpen') === '1'}
                onChange={this.handleClientSettingCheckboxChange.bind(this, 'networkPortOpen')}>
                <FormattedMessage
                  id="settings.connectivity.port.open.label"
                  defaultMessage="Open Port"
                />
              </Checkbox>
            </div>
          </div>
          <div className="form__row">
            <div className="form__column form__column--half">
              <label className="form__label">
                Reported IP/Hostname
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'networkLocalAddress')}
                value={this.getFieldValue('networkLocalAddress')} />
            </div>
            <div className="form__column form__column--half">
              <label className="form__label">
                Maximum HTTP Connections
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'networkHttpMaxOpen')}
                value={this.getFieldValue('networkHttpMaxOpen')} />
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              id="settings.connectivity.ddd.heading"
              defaultMessage="Decentralized Peer Discovery"
            />
          </div>
          <div className="form__row">
            <div className="form__column form__column--small">
              <label className="form__label">
                <FormattedMessage
                  id="settings.connectivity.dht.port.label"
                  defaultMessage="DHT Port"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'dhtPort')}
                value={this.getFieldValue('dhtPort')} />
            </div>
            <div className="form__column form__column--auto  form__column--unlabled">
              <Checkbox
                checked={this.getDHTEnabledValue()}
                onChange={this.handleDHTToggle}>
                <FormattedMessage
                  id="settings.connectivity.dht.label"
                  defaultMessage="Enable DHT"
                />
              </Checkbox>
            </div>
            <div className="form__column form__column--auto form__column--unlabled">
              <Checkbox
                checked={this.getFieldValue('protocolPex') === '1'}
                onChange={this.handleClientSettingCheckboxChange.bind(this, 'protocolPex')}>
                <FormattedMessage
                  id="settings.connectivity.peer.exchange.label"
                  defaultMessage="Enable Peer Exchange"
                />
              </Checkbox>
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            Peers
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.connectivity.peers.min.label"
                  defaultMessage="Minimum Peers"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMinPeersNormal')}
                value={this.getFieldValue('throttleMinPeersNormal')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.connectivity.peers.max.label"
                  defaultMessage="Maxmimum Peers"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxPeersNormal')}
                value={this.getFieldValue('throttleMaxPeersNormal')} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.connectivity.peers.seeding.min.label"
                  defaultMessage="Minimum Peers Seeding"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMinPeersSeed')}
                value={this.getFieldValue('throttleMinPeersSeed')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.connectivity.peers.seeding.max.label"
                  defaultMessage="Maxmimum Peers Seeding"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxPeersSeed')}
                value={this.getFieldValue('throttleMaxPeersSeed')} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column form__column--half">
              <label className="form__label">
                <FormattedMessage
                  id="settings.connectivity.peers.desired.label"
                  defaultMessage="Peers Desired"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'trackersNumWant')}
                value={this.getFieldValue('trackersNumWant')} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
