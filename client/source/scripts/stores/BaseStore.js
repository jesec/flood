import {EventEmitter} from 'events';

export default class BaseStore extends EventEmitter {
  constructor() {
    super(...arguments);

    this.dispatcherID = null;
    this.on('uncaughtException', this.handleError);
    this.requests = {};
    this.setMaxListeners(20);
  }

  beginRequest(id) {
    this.requests[id] = true;
  }

  handleError(error) {
    console.trace(error);
  }

  isRequestPending(id) {
    if (this.requests[id] == null || this.requests[id] === false) {
      return false;
    }

    return true;
  }

  listen(event, callback) {
    this.on(event, callback);
  }

  resolveRequest(id) {
    this.requests[id] = false;
  }

  unlisten(event, callback) {
    this.removeListener(event, callback);
  }
}
