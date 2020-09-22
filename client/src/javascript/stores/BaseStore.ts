import {EventEmitter} from 'events';
import type TypedEmitter from 'typed-emitter';

import type {BaseEvents} from '../constants/EventTypes';

export default class BaseStore<E extends BaseEvents = BaseEvents> extends (EventEmitter as {
  new <T>(): TypedEmitter<T>;
})<E> {
  dispatcherID: string | null = null;
  requests: Record<string, boolean> = {};

  constructor() {
    super();

    this.on('uncaughtException', (error) => {
      throw new Error(error);
    });

    this.setMaxListeners(20);
  }

  beginRequest(id: string) {
    this.requests[id] = true;
  }

  resolveRequest(id: string) {
    delete this.requests[id];
  }

  isRequestPending(id: string) {
    if (this.requests[id] == null) {
      return false;
    }

    return true;
  }

  listen<T extends keyof E, H extends E[T]>(event: T, eventHandler: H): void {
    this.on(event, eventHandler);
  }

  unlisten<T extends keyof E, H extends E[T]>(event: T, eventHandler: H): void {
    this.removeListener(event, eventHandler);
  }
}
