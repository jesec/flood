import {EventEmitter} from 'events';
import type TypedEmitter from 'typed-emitter';

import type {UserInDatabase} from '@shared/schema/Auth';

import type {ServiceInstances} from '.';

class BaseService<E = unknown> extends (EventEmitter as {
  new <T>(): TypedEmitter<T>;
})<E> {
  user: UserInDatabase;
  services?: ServiceInstances;

  constructor(user: UserInDatabase) {
    super();
    this.user = user;
  }

  destroy() {
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
