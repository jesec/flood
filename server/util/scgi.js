'use strict';

const Deserializer = require('xmlrpc/lib/deserializer');
const net = require('net');
const Serializer = require('xmlrpc/lib/serializer');

const config = require('../../config');

const nullChar = String.fromCharCode(0);

let isRequestPending = false;
let lastResponseTimestamp = 0;
const pendingRequests = [];

const sendDefferedMethodCall = () => {
  if (pendingRequests.length > 0) {
    isRequestPending = true;

    const nextRequest = pendingRequests.shift();

    sendMethodCall(nextRequest.methodName, nextRequest.parameters)
      .then(nextRequest.resolve)
      .catch(nextRequest.reject);
  }
};

const sendMethodCall = (methodName, parameters) => {
  return new Promise((resolve, reject) => {
    const connectMethod = config.scgi.socket
      ? {path: config.scgi.socketPath}
      : {port: config.scgi.port, host: config.scgi.host};

    const deserializer = new Deserializer('utf8');
    const stream = net.connect(connectMethod);
    const xml = Serializer.serializeMethodCall(methodName, parameters);
    const xmlLength = Buffer.byteLength(xml, 'utf8');

    stream.setEncoding('UTF8');

    const headerItems = [
      `CONTENT_LENGTH${nullChar}${xmlLength}${nullChar}`,
      `SCGI${nullChar}1${nullChar}`
    ];

    const headerLength = headerItems.reduce((accumulator, headerItem) => {
      return accumulator += headerItem.length;
    }, 0);

    stream.write(`${headerLength}:${headerItems.join('')},${xml}`);

    deserializer.deserializeMethodResponse(stream, (error, response) => {
      isRequestPending = false;

      // We avoid initiating any deffered requests until at least 250ms have
      // since the previous response.
      const currentTimestamp = Date.now();
      const timeSinceLastResponse = currentTimestamp - lastResponseTimestamp;

      if (timeSinceLastResponse <= 250) {
        const delay = 250 - timeSinceLastResponse;
        setTimeout(sendDefferedMethodCall, delay);
        lastResponseTimestamp = currentTimestamp + delay;
      } else {
        sendDefferedMethodCall();
        lastResponseTimestamp = currentTimestamp;
      }

      if (error) {
        return reject(error);
      }

      return resolve(response);
    });
  });
};

module.exports = {
  methodCall(methodName, parameters) {
    // We only allow one request at a time.
    if (isRequestPending) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({methodName, parameters, resolve, reject});
      });
    } else {
      isRequestPending = true;
      return sendMethodCall(methodName, parameters);
    }
  }
};
