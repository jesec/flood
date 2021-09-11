import {FC, useState} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox, Form, FormRow, Textbox} from '@client/ui';

import {ClientSettings} from '@shared/types/ClientSettings';

import {getChangedClientSetting, handleClientSettingChange} from './SettingsUtils';
import ModalFormSectionHeader from '../ModalFormSectionHeader';

interface ConnectivityTabProps {
  onClientSettingsChange: (changeSettings: Partial<ClientSettings>) => void;
}

const ConnectivityTab: FC<ConnectivityTabProps> = ({onClientSettingsChange}: ConnectivityTabProps) => {
  const [changedClientSettings, setChangedClientSettings] = useState<Partial<ClientSettings>>({});

  return (
    <Form
      onChange={({event}) => {
        const newChangedClientSettings = {
          ...changedClientSettings,
          ...handleClientSettingChange(event),
        };

        setChangedClientSettings(newChangedClientSettings);
        onClientSettingsChange(newChangedClientSettings);
      }}
    >
      <ModalFormSectionHeader>
        <Trans id="settings.connectivity.incoming.heading" />
      </ModalFormSectionHeader>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'networkPortRange')}
          id="networkPortRange"
          label={<Trans id="settings.connectivity.port.range.label" />}
          width="one-quarter"
        />
        <Checkbox
          defaultChecked={getChangedClientSetting(changedClientSettings, 'networkPortRandom')}
          grow={false}
          id="networkPortRandom"
          labelOffset
          matchTextboxHeight
        >
          <Trans id="settings.connectivity.port.randomize.label" />
        </Checkbox>
        <Checkbox
          defaultChecked={getChangedClientSetting(changedClientSettings, 'networkPortOpen')}
          grow={false}
          id="networkPortOpen"
          labelOffset
          matchTextboxHeight
        >
          <Trans id="settings.connectivity.port.open.label" />
        </Checkbox>
      </FormRow>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'networkLocalAddress')}
          id="networkLocalAddress"
          label={<Trans id="settings.connectivity.ip.hostname.label" />}
        />
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'networkHttpMaxOpen')}
          id="networkHttpMaxOpen"
          label={<Trans id="settings.connectivity.max.http.connections" />}
        />
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.connectivity.dpd.heading" />
      </ModalFormSectionHeader>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'dhtPort')}
          id="dhtPort"
          label={<Trans id="settings.connectivity.dht.port.label" />}
          width="one-quarter"
        />
        <Checkbox
          defaultChecked={getChangedClientSetting(changedClientSettings, 'dht')}
          grow={false}
          id="dht"
          labelOffset
          matchTextboxHeight
        >
          <Trans id="settings.connectivity.dht.label" />
        </Checkbox>
        <Checkbox
          defaultChecked={getChangedClientSetting(changedClientSettings, 'protocolPex')}
          grow={false}
          id="protocolPex"
          labelOffset
          matchTextboxHeight
        >
          <Trans id="settings.connectivity.peer.exchange.label" />
        </Checkbox>
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.connectivity.peers.heading" />
      </ModalFormSectionHeader>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleMinPeersNormal')}
          id="throttleMinPeersNormal"
          label={<Trans id="settings.connectivity.peers.min.label" />}
        />
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleMaxPeersNormal')}
          id="throttleMaxPeersNormal"
          label={<Trans id="settings.connectivity.peers.max.label" />}
        />
      </FormRow>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleMinPeersSeed')}
          id="throttleMinPeersSeed"
          label={<Trans id="settings.connectivity.peers.seeding.min.label" />}
        />
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleMaxPeersSeed')}
          id="throttleMaxPeersSeed"
          label={<Trans id="settings.connectivity.peers.seeding.max.label" />}
        />
      </FormRow>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'trackersNumWant')}
          id="trackersNumWant"
          label={<Trans id="settings.connectivity.peers.desired.label" />}
          width="one-half"
        />
      </FormRow>
    </Form>
  );
};

export default ConnectivityTab;
