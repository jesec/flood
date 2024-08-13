import {EventEmitter} from 'node:events';

import type {UserInDatabase} from '@shared/schema/Auth';
import type {EventMap} from 'typed-emitter';
import type TypedEmitter from 'typed-emitter';

import type {ServiceInstances} from '.';

class BaseService<E extends EventMap> extends (EventEmitter as {
  new <T extends EventMap>(): TypedEmitter<T>;
})<E> {
  user: UserInDatabase;
  services?: ServiceInstances;

  constructor(user: UserInDatabase) {
    super();
    this.user = user;
  }

  async destroy(_drop: boolean): Promise<void> {
    delete this.services;
  }

  onServicesUpdated = () => {
    // do nothing.
  };

  updateUser(user: UserInDatabase) {
    this.user = user;
  }

  updateServices(service?: ServiceInstances) {
    this.services = service;
    this.onServicesUpdated();
  }
}

export default BaseService;
