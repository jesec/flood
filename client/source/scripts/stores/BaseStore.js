import {EventEmitter} from 'events';

export default class BaseStore extends EventEmitter {
  constructor() {
    super();

    this.dispatcherID = null;
    this.on('uncaughtException', this.handleError);
    this.setMaxListeners(20);
  }

  handleError(error) {
    console.trace(error);
  }

  listen(event, callback) {
    this.on(event, callback);
  }

  unlisten(event, callback) {
    this.removeListener(event, callback);
  }
}
