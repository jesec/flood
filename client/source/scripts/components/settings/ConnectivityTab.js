import _ from 'lodash';
import React from 'react';

import Checkbox from '../forms/Checkbox';
import SettingsTab from './SettingsTab';

export default class ConnectivityTab extends SettingsTab {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  render() {
    return (
      <div className="form">
        <div className="form__section">
          <div className="form__section__heading">
            Listening Port
          </div>
          <div className="form__row">
            <div className="form__column form__column--small">
              <label className="form__label">
                Port Range
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'networkPortRange')}
                value={this.getFieldValue('networkPortRange')} />
            </div>
            <div className="form__column form__column--auto form__column--unlabled">
              <Checkbox
                checked={this.getFieldValue('networkPortRandom') === '1'}
                onChange={this.handleClientSettingCheckboxChange.bind(this, 'networkPortRandom')}>
                Randomize Port
              </Checkbox>
            </div>
            <div className="form__column form__column--auto form__column--unlabled">
              <Checkbox
                checked={this.getFieldValue('networkPortOpen') === '1'}
                onChange={this.handleClientSettingCheckboxChange.bind(this, 'networkPortOpen')}>
                Open Port
              </Checkbox>
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            DHT
          </div>
          <div className="form__row">
            <div className="form__column form__column--small">
              <label className="form__label">
                Port
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'dhtPort')}
                value={this.getFieldValue('dhtPort')} />
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
                Minimum Peers
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMinPeersNormal')}
                value={this.getFieldValue('throttleMinPeersNormal')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                Maximum Peers
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxPeersNormal')}
                value={this.getFieldValue('throttleMaxPeersNormal')} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                Minimum Peers Seeding
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMinPeersSeed')}
                value={this.getFieldValue('throttleMinPeersSeed')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                Maximum Peers Seeding
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxPeersSeed')}
                value={this.getFieldValue('throttleMaxPeersSeed')} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column form__column--half">
              <label className="form__label">
                Amount Desired
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
