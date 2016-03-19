'use strict';

let Deserializer = require('xmlrpc/lib/deserializer');
let net = require('net');
let Q = require('q');
let Serializer = require('xmlrpc/lib/serializer');

let config = require('../../config');

let scgi = {
  methodCall: (methodName, parameters) => {
    let deferred = Q.defer();
    let deserializer = new Deserializer('utf8');
    let headerLength = 0;
    let nullChar = String.fromCharCode(0);
    let stream = net.connect({port: config.hostPort, host: config.host});
    let xml = Serializer.serializeMethodCall(methodName, parameters);

    stream.setEncoding('UTF8');

    // TODO: Remove this debugging info.
    stream.on('error', () => {
      console.trace(error);
    });

    let headerItems = [
      `CONTENT_LENGTH${nullChar}${xml.length}${nullChar}`,
      `SCGI${nullChar}1${nullChar}`
    ];

    headerItems.forEach((item) => {
      headerLength += item.length;
    });

    let header = `${headerLength}:`;

    headerItems.forEach((headerItem) => {
      header += headerItem;
    });

    stream.write(`${header},${xml}`);

    deserializer.deserializeMethodResponse(stream, (error, response) => {
      if (error) {
        return deferred.reject(error);
      }
      return deferred.resolve(response);
    });

    return deferred.promise;
  }
}

module.exports = scgi;
