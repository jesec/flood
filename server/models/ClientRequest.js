'use strict';

let mkdirp = require('mkdirp');
let mv = require('mv');
let path = require('path');
let util = require('util');

let clientSettingsMap = require('../../shared/constants/clientSettingsMap');
let clientUtil = require('../util/clientUtil');
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

    if (options.name) {
      this.name = options.name;
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
    if (error.code === 'ECONNREFUSED') {
      console.error(`Connection refused at ${error.address}:${error.port}. ` +
        `Check these values in config.js and ensure that rTorrent is running.`);
    }

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
    let handleSuccess = this.handleSuccess.bind(this);
    let handleError = this.handleError.bind(this);

    scgi.methodCall('system.multicall', [this.requests])
      .then(handleSuccess)
      .catch(handleError);
  }

  // TODO: Separate these and add support for additional clients.
  // rTorrent method calls.
  addFilesMethodCall(options) {
    let files = this.getEnsuredArray(options.files);
    let path = options.path;
    let start = options.start;

    files.forEach((file) => {
      let methodCall = 'load.raw_start';
      let parameters = ['', file.buffer];
      let timeAdded = Math.floor(Date.now() / 1000);

      if (path && path !== '') {
        parameters.push(`d.directory.set="${path}"`);
      }

      parameters.push(`d.custom.set=x-filename,${file.originalname}`);
      parameters.push(`d.custom.set=addtime,${timeAdded}`);

      // The start value is a string because it was appended to a FormData
      // object.
      if (start === 'false') {
        methodCall = 'load.raw';
      }

      this.requests.push(this.getMethodCall(methodCall, parameters));
    });
  }

  addURLsMethodCall(options) {
    let path = options.path;
    let start = options.start;
    let tagsArr = options.tags;
    let urls = this.getEnsuredArray(options.urls);

    urls.forEach((url) => {
      let methodCall = 'load.start';
      let parameters = ['', url];
      let timeAdded = Math.floor(Date.now() / 1000);

      if (path) {
        parameters.push(`d.directory.set="${path}"`);
      }

      if (tagsArr) {
        let tags = tagsArr.reduce((memo, currentTag) => {
          let tag = encodeURIComponent(currentTag.trim());

          if (tag !== '' && memo.indexOf(tag) === -1) {
            memo.push(tag);
          }

          return memo;
        }, []).join(',');

        parameters.push(`d.custom1.set="${tags}"`);
      }

      parameters.push(`d.custom.set=addtime,${timeAdded}`);

      if (!start) {
        methodCall = 'load.normal';
      }

      this.requests.push(this.getMethodCall(methodCall, parameters));
    });
  }

  checkHashMethodCall(options) {
    let hashes = this.getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      this.requests.push(this.getMethodCall('d.check_hash', [hash]));
    })
  }

  createDirectoryMethodCall(options) {
    if (options.path) {
      mkdirp(options.path, (error) => {
        if (error) {
          console.trace('Error creating directory.', error);
        }
      });
    }
  }

  fetchSettingsMethodCall(options) {
    let requestedSettings = [];

    if (options.requestedSettings) {
      requestedSettings = options.requestedSettings;
    } else {
      requestedSettings = clientSettingsMap.defaults.map((settingsKey) => {
        return clientSettingsMap[settingsKey];
      });
    }

    // Ensure client's response gets mapped to the correct requested keys.
    if (options.setRequestedKeysArr) {
      options.setRequestedKeysArr(requestedSettings);
    }

    requestedSettings.forEach((settingsKey) => {
      this.requests.push(this.getMethodCall(settingsKey));
    });
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
    let filenames = this.getEnsuredArray(options.filenames);
    let sourcePaths = this.getEnsuredArray(options.sourcePaths);

    sourcePaths.forEach((source, index) => {
      let callback = () => {};
      let destination = `${destinationPath}${path.sep}${filenames[index]}`;
      let isLastRequest = index + 1 === sourcePaths.length;

      if (isLastRequest) {
        callback = this.handleSuccess.bind(this);
      }

      if (source !== destination) {
        mv(source, destination, {mkdirp: true}, callback);
      } else if (isLastRequest) {
        callback();
      }
    });
  }

  removeTorrentsMethodCall(options) {
    let hashes = this.getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      this.requests.push(this.getMethodCall('d.erase', [hash]));
    });
  }

  setDownloadPathMethodCall(options) {
    let hashes = this.getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      this.requests.push(this.getMethodCall('d.directory.set',
        [hash, options.path]));
      this.requests.push(this.getMethodCall('d.open', [hash]));
      this.requests.push(this.getMethodCall('d.close', [hash]));
    });
  }

  setFilePriorityMethodCall(options) {
    let fileIndices = this.getEnsuredArray(options.fileIndices);
    let hashes = this.getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      fileIndices.forEach((fileIndex) => {
        this.requests.push(this.getMethodCall('f.priority.set',
          [`${hash}:f${fileIndex}`, options.priority]));
      });
      this.requests.push(this.getMethodCall('d.update_priorities', [hash]));
    });
  }

  setPriorityMethodCall(options) {
    let hashes = this.getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      this.requests.push(this.getMethodCall('d.priority.set',
        [hash, options.priority]));
      this.requests.push(this.getMethodCall('d.update_priorities',
        [hash]));
    });
  }

  setSettingsMethodCall(options) {
    let settings = this.getEnsuredArray(options.settings);

    settings.forEach((setting) => {
      if (setting.overrideLocalSetting) {
        this.requests.push(this.getMethodCall(setting.id, setting.data));
      } else {
        this.requests.push(this.getMethodCall(`${clientSettingsMap[setting.id]}.set`,
          ['', setting.data]));
      }
    });
  }

  setTaxonomyMethodCall(options) {
    let methodName = 'd.custom1.set';

    let tags = options.tags.reduce((memo, currentTag) => {
      let tag = encodeURIComponent(currentTag.trim());

      if (tag !== '' && memo.indexOf(tag) === -1) {
        memo.push(tag);
      }

      return memo;
    }, []).join(',');

    this.getEnsuredArray(options.hashes).forEach((hash) => {
      this.requests.push(this.getMethodCall(methodName, [hash, tags]));
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
