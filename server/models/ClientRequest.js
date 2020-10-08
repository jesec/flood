/**
 * This file is deprecated in favor of clientGatewayService.
 */
import util from 'util';

import {clientSettingsMap} from '../../shared/constants/clientSettingsMap';
import rTorrentPropMap from '../util/rTorrentPropMap';

const getEnsuredArray = (item) => {
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

    this.clientRequestManager.methodCall('system.multicall', [this.requests]).then(handleSuccess).catch(handleError);
  }

  fetchSettings(options) {
    let {requestedSettings} = options;

    if (requestedSettings == null) {
      requestedSettings = Object.values(clientSettingsMap);
    }

    // Ensure client's response gets mapped to the correct requested keys.
    if (options.setRequestedKeysArr) {
      options.setRequestedKeysArr(requestedSettings);
    }

    requestedSettings.forEach((settingsKey) => {
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

  setFilePriority(options) {
    const indices = getEnsuredArray(options.indices);
    const hashes = getEnsuredArray(options.hashes);

    hashes.forEach((hash) => {
      indices.forEach((index) => {
        this.requests.push(getMethodCall('f.priority.set', [`${hash}:f${index}`, options.priority]));
      });
      this.requests.push(getMethodCall('d.update_priorities', [hash]));
    });
  }

  setSettings(options) {
    const settings = getEnsuredArray(options.settings);

    settings.forEach((setting) => {
      this.requests.push(getMethodCall(`${clientSettingsMap[setting.id]}.set`, ['', setting.data]));
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

    getEnsuredArray(options.hashes).forEach((hash) => {
      this.requests.push(getMethodCall(methodName, [hash, tags]));
    });
  }

  setTracker(options) {
    const existingTrackerIndex = 0;
    const {tracker} = options;

    getEnsuredArray(options.hashes).forEach((hash) => {
      // Disable existing tracker
      this.requests.push(getMethodCall('t.disable', [`${hash}:t${existingTrackerIndex}`]));
      // Insert new tracker
      this.requests.push(getMethodCall('d.tracker.insert', [hash, `${existingTrackerIndex}`, tracker]));
      // Save full session to apply tracker change
      this.requests.push(getMethodCall('d.save_full_session', [hash]));
    });
  }

  setThrottle(options) {
    let methodName = 'throttle.global_down.max_rate.set';
    if (options.direction === 'upload') {
      methodName = 'throttle.global_up.max_rate.set';
    }
    this.requests.push(getMethodCall(methodName, ['', options.throttle]));
  }

  getSessionPath() {
    this.requests.push(getMethodCall('session.path'));
  }
}

export default ClientRequest;
