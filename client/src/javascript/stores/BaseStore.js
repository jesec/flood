import {EventEmitter} from 'events';

export default class BaseStore extends EventEmitter {
  constructor(...eventEmitterConfig) {
    super(...eventEmitterConfig);

    this.dispatcherID = null;
    this.on('uncaughtException', error => {
      throw new Error(error);
    });
    this.requests = {};
    this.setMaxListeners(20);
  }

  beginRequest(id) {
    this.requests[id] = true;
  }

  isRequestPending(id) {
    if (this.requests[id] == null) {
      return false;
    }

    return true;
  }

  listen(event, callback) {
    this.on(event, callback);
  }

  resolveRequest(id) {
    delete this.requests[id];
  }

  unlisten(event, callback) {
    this.removeListener(event, callback);
  }
}
