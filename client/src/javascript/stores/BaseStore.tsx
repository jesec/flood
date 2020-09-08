import {EventEmitter} from 'events';
import type TypedEmitter from 'typed-emitter';

import type {EventType} from '../constants/EventTypes';

export default class BaseStore extends (EventEmitter as new () => TypedEmitter<
  Record<EventType, (payload?: unknown) => void>
>) {
  dispatcherID: string | null = null;
  requests: Record<string, boolean> = {};

  constructor() {
    // eslint-disable-next-line constructor-super
    super();

    this.on('uncaughtException', (error) => {
      throw new Error(error as string | undefined);
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

  listen(event: EventType, eventHandler: (payload?: unknown) => void): void {
    this.on(event, eventHandler);
  }

  unlisten(event: EventType, eventHandler: (payload?: unknown) => void): void {
    this.removeListener(event, eventHandler);
  }
}
