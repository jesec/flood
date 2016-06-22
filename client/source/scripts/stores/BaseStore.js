import {EventEmitter} from 'events';

export default class BaseStore extends EventEmitter {
  constructor() {
    super(...arguments);

    this.dispatcherID = null;
    this.on('uncaughtException', this.handleError);
    this.requests = {};
    this.setMaxListeners(20);
  }

  emit(eventName) {
    super.emit(...arguments);
    if (eventName == null) {
      console.warn('Event is undefined!');
    }
  }

  beginRequest(id) {
    this.requests[id] = true;
  }

  handleError(error) {
    console.trace(error);
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
