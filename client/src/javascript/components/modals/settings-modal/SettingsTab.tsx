import React from 'react';
import {WrappedComponentProps} from 'react-intl';

import type {ClientSetting, ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSettings} from '@shared/types/FloodSettings';

interface SettingsTabProps extends WrappedComponentProps {
  clientSettings: ClientSettings;
  floodSettings: FloodSettings;
  onSettingsChange: (changeSettings: Partial<FloodSettings>) => void;
  onClientSettingsChange: (changeSettings: Partial<ClientSettings>) => void;
}

interface SettingsTabStates {
  changedClientSettings: Partial<ClientSettings>;
}

export default class SettingsTab extends React.Component<SettingsTabProps, SettingsTabStates> {
  constructor(props: SettingsTabProps) {
    super(props);

    this.state = {
      changedClientSettings: {},
    };
  }

  getChangedClientSetting<T extends ClientSetting>(property: T): ClientSettings[T] {
    if (this.state.changedClientSettings[property] != null) {
      return this.state.changedClientSettings[property] as ClientSettings[T];
    }

    return this.props.clientSettings[property];
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
