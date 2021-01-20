import {FormEvent} from 'react';

import type {ClientSetting, ClientSettings} from '@shared/types/ClientSettings';

import SettingStore from '../../../stores/SettingStore';

export const getChangedClientSetting = <T extends ClientSetting>(
  changedClientSettings: Partial<ClientSettings>,
  property: T,
): ClientSettings[T] | undefined => {
  if (changedClientSettings[property] != null) {
    return changedClientSettings[property] as ClientSettings[T];
  }

  return SettingStore.clientSettings?.[property];
};

export const handleClientSettingChange = (event: FormEvent<HTMLFormElement> | Event): Partial<ClientSettings> => {
  const inputElement = event.target as HTMLInputElement;
  const property = inputElement.name as ClientSetting;
  const {value, type, checked} = inputElement;

  let changedClientSetting: Partial<ClientSettings> = {};
  if (type === 'checkbox') {
    changedClientSetting = {[property]: checked};
  } else {
    changedClientSetting = {[property]: value};
  }

  return changedClientSetting;
};
