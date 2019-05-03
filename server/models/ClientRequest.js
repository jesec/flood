/**
 * This file is deprecated in favor of clientGatewayService.
 */
const mkdirp = require('mkdirp');
const mv = require('mv');
const path = require('path');
const util = require('util');

const clientSettingsMap = require('../../shared/constants/clientSettingsMap');
const rTorrentPropMap = require('../util/rTorrentPropMap');
const torrentStatusMap = require('../../shared/constants/torrentStatusMap');

const addTagsToRequest = (tagsArr, requestParameters) => {
  if (tagsArr && tagsArr.length) {
    const tags = tagsArr
      .reduce((accumulator, currentTag) => {
        const tag = encodeURIComponent(currentTag.trim());

        if (tag !== '' && accumulator.indexOf(tag) === -1) {
          accumulator.push(tag);
        }

        return accumulator;
      }, [])
      .join(',');

    requestParameters.push(`d.custom1.set="${tags}"`);
  }

  return requestParameters;
};

const getEnsuredArray = item => {
  if (!util.isArray(item)) {
    return [item];
  }
  return item;
};

const getMethodCall = (methodName, params) => {
  params = params || [];
  return {methodName, params};
};

class ClientRequest {
  constructor(user, services, options) {
    options = options || {};

    this.services = services;
    this.user = user;
    this.clientRequestManager = this.services.clientRequestManager;

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

  // TODO: Move this to util, doesn't belong here
  createDirectory(options) {
    if (options.path) {
      mkdirp(options.path, error => {
        if (error) {
          console.trace('Error creating directory.', error);
        }
      });
    }
  }

  clearRequestQueue() {
    this.requests = [];
  }

  handleError(error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(
        `Connection refused at ${error.address}${error.port ? `:${error.port}` : ''}. ` +
          'Check these values in config.js and ensure that rTorrent is running.',
      );
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
    const handleSuccess = this.handleSuccess.bind(this);
    const handleError = this.handleError.bind(this);

    this.clientRequestManager
      .methodCall('system.multicall', [this.requests])
      .then(handleSuccess)
      .catch(handleError);
  }

  // TODO: Separate these and add support for additional clients.
  // rTorrent method calls.
  addFiles(options) {
    const files = getEnsuredArray(options.files);
    const {path: destinationPath, isBasePath, start, tags: tagsArr} = options;

    files.forEach(file => {
      let methodCall = 'load.raw_start';
      let parameters = ['', file.buffer];
      const timeAdded = Math.floor(Date.now() / 1000);

      if (destinationPath) {
        if (isBasePath) {
          parameters.push(`d.directory_base.set="${destinationPath}"`);
        } else {
          parameters.push(`d.directory.set="${destinationPath}"`);
        }
      }

      parameters = addTagsToRequest(tagsArr, parameters);

      parameters.push(`d.custom.set=x-filename,${file.originalname}`);
      parameters.push(`d.custom.set=addtime,${timeAdded}`);

      // The start value is a string because it was appended to a FormData
      // object.
      if (start === 'false') {
        methodCall = 'load.raw';
      }

      this.requests.push(getMethodCall(methodCall, parameters));
    });
  }

  addURLs(options) {
    const {path: destinationPath, isBasePath, start, tags: tagsArr} = options;
    const urls = getEnsuredArray(options.urls);

    urls.forEach(url => {
      let methodCall = 'load.start';
      let parameters = ['', url];
      const timeAdded = Math.floor(Date.now() / 1000);

      if (destinationPath) {
        if (isBasePath) {
          parameters.push(`d.directory_base.set="${destinationPath}"`);
        } else {
          parameters.push(`d.directory.set="${destinationPath}"`);
        }
      }

      parameters = addTagsToRequest(tagsArr, parameters);

      parameters.push(`d.custom.set=addtime,${timeAdded}`);

      if (!start) {
        methodCall = 'load.normal';
      }

      this.requests.push(getMethodCall(methodCall, parameters));
    });
  }

  checkHash(options) {
    const {torrentService} = this.services;
    const hashes = getEnsuredArray(options.hashes);
    const stoppedHashes = hashes.filter(hash =>
      torrentService.getTorrent(hash).status.includes(torrentStatusMap.stopped),
    );

    const hashesToStart = [];

    this.stopTorrents({hashes});

    hashes.forEach(hash => {
      this.requests.push(getMethodCall('d.check_hash', [hash]));

      if (!stoppedHashes.includes(hash)) {
        hashesToStart.push(hash);
      }
    });

    if (hashesToStart.length) {
      this.startTorrents({hashes: hashesToStart});
    }
  }

  fetchSettings(options) {
    let {requestedSettings} = options;

    if (requestedSettings == null) {
      requestedSettings = clientSettingsMap.defaults.map(settingsKey => clientSettingsMap[settingsKey]);
    }

    // Ensure client's response gets mapped to the correct requested keys.
    if (options.setRequestedKeysArr) {
      options.setRequestedKeysArr(requestedSettings);
    }

    requestedSettings.forEach(settingsKey => {
      this.requests.push(getMethodCall(settingsKey));
    });
  }

  getTorrentDetails(options) {
    const peerParams = [options.hash, ''].concat(options.peerProps);
    const fileParams = [options.hash, ''].concat(options.fileProps);
    const trackerParams = [options.hash, ''].concat(options.trackerProps);

    this.requests.push(getMethodCall('p.multicall', peerParams));
    this.requests.push(getMethodCall('f.multicall', fileParams));
    this.requests.push(getMethodCall('t.multicall', trackerParams));
  }

  getTorrentList(options) {
    this.requests.push(getMethodCall('d.multicall2', options.props));
  }

  getTransferData() {
    Object.keys(rTorrentPropMap.transferData).forEach(key => {
      this.requests.push(getMethodCall(rTorrentPropMap.transferData[key]));
    });
  }

  listMethods(options) {
    const args = getEnsuredArray(options.args);
    this.requests.push(getMethodCall(options.method, [args]));
  }

  moveTorrents(options) {
    const {destinationPath} = options;
    const filenames = getEnsuredArray(options.filenames);
    const sourcePaths = getEnsuredArray(options.sourcePaths);

    sourcePaths.forEach((source, index) => {
      let callback = () => {};
      const destination = `${destinationPath}${path.sep}${filenames[index]}`;
      const isLastRequest = index + 1 === sourcePaths.length;

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

  setDownloadPath(options) {
    const hashes = getEnsuredArray(options.hashes);

    let pathMethod;
    if (options.isBasePath) {
      pathMethod = 'd.directory_base.set';
    } else {
      pathMethod = 'd.directory.set';
    }

    hashes.forEach(hash => {
      this.requests.push(getMethodCall(pathMethod, [hash, options.path]));
      this.requests.push(getMethodCall('d.open', [hash]));
      this.requests.push(getMethodCall('d.close', [hash]));
    });
  }

  setFilePriority(options) {
    const fileIndices = getEnsuredArray(options.fileIndices);
    const hashes = getEnsuredArray(options.hashes);

    hashes.forEach(hash => {
      fileIndices.forEach(fileIndex => {
        this.requests.push(getMethodCall('f.priority.set', [`${hash}:f${fileIndex}`, options.priority]));
      });
      this.requests.push(getMethodCall('d.update_priorities', [hash]));
    });
  }

  setPriority(options) {
    const hashes = getEnsuredArray(options.hashes);

    hashes.forEach(hash => {
      this.requests.push(getMethodCall('d.priority.set', [hash, options.priority]));
      this.requests.push(getMethodCall('d.update_priorities', [hash]));
    });
  }

  setSettings(options) {
    const settings = getEnsuredArray(options.settings);

    settings.forEach(setting => {
      if (setting.overrideLocalSetting) {
        this.requests.push(getMethodCall(setting.id, setting.data));
      } else {
        this.requests.push(getMethodCall(`${clientSettingsMap[setting.id]}.set`, ['', setting.data]));
      }
    });
  }

  setTaxonomy(options) {
    const methodName = 'd.custom1.set';

    const tags = options.tags
      .reduce((memo, currentTag) => {
        const tag = encodeURIComponent(currentTag.trim());

        if (tag !== '' && memo.indexOf(tag) === -1) {
          memo.push(tag);
        }

        return memo;
      }, [])
      .join(',');

    getEnsuredArray(options.hashes).forEach(hash => {
      this.requests.push(getMethodCall(methodName, [hash, tags]));
    });
  }

  setThrottle(options) {
    let methodName = 'throttle.global_down.max_rate.set';
    if (options.direction === 'upload') {
      methodName = 'throttle.global_up.max_rate.set';
    }
    this.requests.push(getMethodCall(methodName, ['', options.throttle]));
  }

  startTorrents(options) {
    if (!options.hashes) {
      console.error("startTorrents requires key 'hashes'.");
      return;
    }

    getEnsuredArray(options.hashes).forEach(hash => {
      this.requests.push(getMethodCall('d.open', [hash]));
      this.requests.push(getMethodCall('d.start', [hash]));
    });
  }

  stopTorrents(options) {
    if (!options.hashes) {
      console.error("stopTorrents requires key 'hashes'.");
      return;
    }

    getEnsuredArray(options.hashes).forEach(hash => {
      this.requests.push(getMethodCall('d.stop', [hash]));
      this.requests.push(getMethodCall('d.close', [hash]));
    });
  }
}

module.exports = ClientRequest;
