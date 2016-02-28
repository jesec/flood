'use strict';

let util = require('util');

let clientUtil = require('../util/clientUtil');
let Q = require('q');
let rTorrentPropMap = require('../util/rTorrentPropMap');
let scgi = require('../util/scgi');
let stringUtil = require('../../shared/util/stringUtil');

class ClientRequest {
  constructor(options) {
    options = options || {};

    this.onCompleteFn = null;
    this.postProcessFn = null;
    this.requests = [];

    if (options.onComplete) {
      this.onCompleteFn = options.onComplete;
    }

    if (options.postProcess) {
      this.postProcessFn = options.postProcess;
    }
  }

  add(request, options) {
    let method = `${request}MethodCall`;
    if (this[method] == null) {
      console.error(`${request} method call is undefined.`);
      return;
    }
    this[method](options);
  }

  getEnsuredArray(item) {
    if (!util.isArray(item)) {
      return [item];
    }
    return item;
  }

  clearRequestQueue() {
    this.requests = [];
  }

  getMethodCall(methodName, params) {
    params = params || [];
    return {methodName, params};
  }

  handleError(error) {
    console.trace(error);

    this.clearRequestQueue();

    if (this.onCompleteFn) {
      this.onCompleteFn(null, error);
    }
  }

  handleSuccess(data) {
    let response = data;

    this.clearRequestQueue();

    if (this.postProcessFn) {
      response = this.postProcessFn(data);
    }

    if (this.onCompleteFn) {
      this.onCompleteFn(response);
    }
  }

  onComplete(fn) {
    this.onCompleteFn = fn;
  }

  postProcess(fn) {
    this.postProcessFn = fn;
  }

  send() {
    scgi.methodCall('system.multicall', [this.requests])
      .then(this.handleSuccess.bind(this))
      .catch(this.handleError.bind(this));
  }

  // TODO: Separate these and add support for additional clients.
  // rTorrent method calls.
  addFilesMethodCall(options) {
    let files = this.getEnsuredArray(options.files);

    files.forEach((file) => {
      let parameters = ['', file.buffer];
      let timeAdded = Math.floor(Date.now() / 1000);

      if (options.path && options.path !== '') {
        parameters.push(`d.directory.set="${options.path}"`);
      }

      parameters.push(`d.custom.set=x-filename,${file.filename}`);
      parameters.push(`d.custom.set=addtime,${timeAdded}`);

      this.requests.push(this.getMethodCall('load.raw_start', parameters));
    });
  }

  addURLsMethodCall(options) {
    let path = options.path;
    let urls = this.getEnsuredArray(options.urls);

    urls.forEach((url) => {
      let parameters = ['', url];
      let timeAdded = Math.floor(Date.now() / 1000);

      if (path && path !== '') {
        parameters.push(`d.directory.set="${path}"`);
      }

      parameters.push(`d.custom.set=addtime,${timeAdded}`);

      this.requests.push(this.getMethodCall('load.start', parameters));
    });
  }

  createDirectoryMethodCall(options) {
    this.requests.push(
      this.getMethodCall('execute', ['mkdir', '-p', options.path])
    );
  }

  getTorrentDetailsMethodCall(options) {
    var peerParams = [options.hash, ''].concat(options.peerProps);
    var fileParams = [options.hash, ''].concat(options.fileProps);
    var trackerParams = [options.hash, ''].concat(options.trackerProps);

    this.requests.push(this.getMethodCall('p.multicall', peerParams));
    this.requests.push(this.getMethodCall('f.multicall', fileParams));
    this.requests.push(this.getMethodCall('t.multicall', trackerParams));
  }

  getTorrentListMethodCall(options) {
    this.requests.push(this.getMethodCall('d.multicall2', options.props));
  }

  getTransferDataMethodCall(options) {
    Object.keys(rTorrentPropMap.transferData).forEach((key) => {
      this.requests.push(this.getMethodCall(rTorrentPropMap.transferData[key]));
    });
  }

  listMethodsMethodCall(options) {
    let args = this.getEnsuredArray(options.args);
    this.requests.push(this.getMethodCall(options.method, [args]));
  }

  moveTorrentsMethodCall(options) {
    let hashes = this.getEnsuredArray(options.hashes);
    let destinationPath = options.destinationPath;
    let sourcePath = options.sourcePath;

    this.moveInProgress = true;

    // let {hashes, destinationPath, sourcePath} = options;
  }

  removeTorrentsMethodCall(options) {
    let hashes = this.getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      this.requests.push(this.getMethodCall('d.erase', [hash]));
    });
  }

  setFilePriorityMethodCall(options) {
    let hashes = this.getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      this.requests.push(this.getMethodCall('f.priority.set',
        [`${hash}:f${options.fileIndex}`, options.priority]));
      this.requests.push(this.getMethodCall('d.update_priorities', [hash]));
    });
  }

  setPriorityMethodCall(options) {
    let hashes = this.getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      this.requests.push(this.getMethodCall('d.set_priority',
        [hash, options.priority]));
      this.requests.push(this.getMethodCall('d.update_priorities',
        [hash]));
    });
  }

  setThrottleMethodCall(options) {
    let methodName = 'throttle.global_down.max_rate.set';
    if (options.direction === 'upload') {
      methodName = 'throttle.global_up.max_rate.set';
    }
    this.requests.push(this.getMethodCall(methodName, ['', options.throttle]));
  }

  startTorrentsMethodCall(options) {
    if (!options.hashes) {
      console.error('startTorrents requires key \'hashes\'.');
      return;
    }

    this.getEnsuredArray(options.hashes).forEach((hash) => {
      this.requests.push(this.getMethodCall('d.open', [hash]));
      this.requests.push(this.getMethodCall('d.start', [hash]));
    });
  }

  stopTorrentsMethodCall(options) {
    if (!options.hashes) {
      console.error('stopTorrents requires key \'hashes\'.');
      return;
    }

    this.getEnsuredArray(options.hashes).forEach((hash) => {
      this.requests.push(this.getMethodCall('d.stop', [hash]));
      this.requests.push(this.getMethodCall('d.close', [hash]));
    });
  }
}

module.exports = ClientRequest;
