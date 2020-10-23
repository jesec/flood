import React from 'react';
import {WrappedComponentProps} from 'react-intl';

import type {ClientSetting, ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSettings} from '@shared/types/FloodSettings';

import SettingStore from '../../../stores/SettingStore';

interface SettingsTabProps extends WrappedComponentProps {
  onSettingsChange: (changeSettings: Partial<FloodSettings>) => void;
  onClientSettingsChange: (changeSettings: Partial<ClientSettings>) => void;
}

interface SettingsTabStates {
  changedClientSettings: Partial<ClientSettings>;
}

class SettingsTab extends React.Component<SettingsTabProps, SettingsTabStates> {
  constructor(props: SettingsTabProps) {
    super(props);

    this.state = {
      changedClientSettings: {},
    };
  }

  getChangedClientSetting<T extends ClientSetting>(property: T): ClientSettings[T] | undefined {
    if (this.state.changedClientSettings[property] != null) {
      return this.state.changedClientSettings[property] as ClientSettings[T];
    }

    return SettingStore.clientSettings?.[property];
  }

  handleClientSettingChange(event: React.FormEvent<HTMLFormElement> | Event) {
    const inputElement = event.target as HTMLInputElement;
    const property = inputElement.name as ClientSetting;
    const {value, type, checked} = inputElement;

    let changedClientSetting: Partial<ClientSettings> = {};
    if (type === 'checkbox') {
      changedClientSetting = {[property]: checked};
    } else {
      changedClientSetting = {[property]: value};
    }

    this.setState((prev) => {
      return {
        changedClientSettings: {
          ...prev.changedClientSettings,
          changedClientSetting,
        },
      };
    });
    this.props.onClientSettingsChange(changedClientSetting);
  }
}

export default SettingsTab;
