import {FormattedMessage} from 'react-intl';

import {Checkbox, Form, FormRow, Textbox} from '@client/ui';

import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsTab from './SettingsTab';

export default class ConnectivityTab extends SettingsTab {
  render() {
    return (
      <Form onChange={({event}) => this.handleClientSettingChange(event)}>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.connectivity.incoming.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('networkPortRange')}
            id="networkPortRange"
            label={<FormattedMessage id="settings.connectivity.port.range.label" />}
            width="one-quarter"
          />
          <Checkbox
            defaultChecked={this.getChangedClientSetting('networkPortRandom')}
            grow={false}
            id="networkPortRandom"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.port.randomize.label" />
          </Checkbox>
          <Checkbox
            defaultChecked={this.getChangedClientSetting('networkPortOpen')}
            grow={false}
            id="networkPortOpen"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.port.open.label" />
          </Checkbox>
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('networkLocalAddress')}
            id="networkLocalAddress"
            label={<FormattedMessage id="settings.connectivity.ip.hostname.label" />}
          />
          <Textbox
            defaultValue={this.getChangedClientSetting('networkHttpMaxOpen')}
            id="networkHttpMaxOpen"
            label={<FormattedMessage id="settings.connectivity.max.http.connections" />}
          />
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.connectivity.dpd.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('dhtPort')}
            id="dhtPort"
            label={<FormattedMessage id="settings.connectivity.dht.port.label" />}
            width="one-quarter"
          />
          <Checkbox
            defaultChecked={this.getChangedClientSetting('dht')}
            grow={false}
            id="dht"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.connectivity.dht.label" />
          </Checkbox>
          <Checkbox
            defaultChecked={this.getChangedClientSetting('protocolPex')}
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
            defaultValue={this.getChangedClientSetting('throttleMinPeersNormal')}
            id="throttleMinPeersNormal"
            label={<FormattedMessage id="settings.connectivity.peers.min.label" />}
          />
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMaxPeersNormal')}
            id="throttleMaxPeersNormal"
            label={<FormattedMessage id="settings.connectivity.peers.max.label" />}
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMinPeersSeed')}
            id="throttleMinPeersSeed"
            label={<FormattedMessage id="settings.connectivity.peers.seeding.min.label" />}
          />
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMaxPeersSeed')}
            id="throttleMaxPeersSeed"
            label={<FormattedMessage id="settings.connectivity.peers.seeding.max.label" />}
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('trackersNumWant')}
            id="trackersNumWant"
            label={<FormattedMessage id="settings.connectivity.peers.desired.label" />}
            width="one-half"
          />
        </FormRow>
      </Form>
    );
  }
}
