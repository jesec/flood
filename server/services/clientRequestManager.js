const BaseService = require('./BaseService');
const scgiUtil = require('../util/scgiUtil');

class ClientRequestManager extends BaseService {
  constructor() {
    super(...arguments);

    this.isRequestPending = false;
    this.lastResponseTimestamp = 0;
    this.pendingRequests = [];

    this.sendDefferedMethodCall = this.sendDefferedMethodCall.bind(this);
    this.sendMethodCall = this.sendMethodCall.bind(this);
    this.methodCall = this.methodCall.bind(this);
  }

  sendDefferedMethodCall() {
    if (this.pendingRequests.length > 0) {
      this.isRequestPending = true;

      const nextRequest = this.pendingRequests.shift();

      this.sendMethodCall(nextRequest.methodName, nextRequest.parameters)
        .then(nextRequest.resolve)
        .catch(nextRequest.reject);
    }
  }

  sendMethodCall(methodName, parameters) {
    const connectionMethod = {
      address: this.user.address,
      port: this.user.port,
      socket: this.user.socket,
      socketPath: this.user.socketPath,
    };

    return scgiUtil.methodCall(connectionMethod, methodName, parameters).then(response => {
      this.isRequestPending = false;

      // We avoid initiating any deffered requests until at least 250ms have
      // since the previous response.
      const currentTimestamp = Date.now();
      const timeSinceLastResponse = currentTimestamp - this.lastResponseTimestamp;

      if (timeSinceLastResponse <= 250) {
        const delay = 250 - timeSinceLastResponse;
        setTimeout(this.sendDefferedMethodCall, delay);
        this.lastResponseTimestamp = currentTimestamp + delay;
      } else {
        this.sendDefferedMethodCall();
        this.lastResponseTimestamp = currentTimestamp;
      }

      return response;
    });
  }

  methodCall(methodName, parameters) {
    // We only allow one request at a time.
    if (this.isRequestPending) {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({methodName, parameters, resolve, reject});
      });
    } else {
      this.isRequestPending = true;
      return this.sendMethodCall(methodName, parameters);
    }
  }
}

module.exports = ClientRequestManager;
