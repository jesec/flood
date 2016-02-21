'use strict';

let Deserializer = require('xmlrpc/lib/deserializer');
let net = require('net');
let Q = require('q');
let Serializer = require('xmlrpc/lib/serializer');

let config = require('../../config');

let scgi = {
  methodCall: function(methodName, parameters) {
    let deferred = Q.defer();
    let deserializer = new Deserializer('utf8');
    let itemLength = 0;
    let nullChar = String.fromCharCode(0);
    let stream = net.connect({
      port: config.hostPort,
      host: config.host
    });
    let xml = Serializer.serializeMethodCall(methodName, parameters);

    stream.setEncoding('UTF8');

    // TODO: Remove this debugging info.
    stream.on('error', function(error) {
      console.trace(error);
    });

    let header = [
      `CONTENT_LENGTH${nullChar}${xml.length}${nullChar}`,
      `SCGI${nullChar}1${nullChar}`
    ];

    header.forEach(function (item) {
      itemLength += item.length;
    });

    let payload = itemLength + ':';

    header.forEach(function(headerItem) {
      payload += headerItem;
    });

    stream.write(`${payload},${xml}`);

    deserializer.deserializeMethodResponse(stream, function (error, response) {
      if (error) {
        return deferred.reject(error);
      }
      return deferred.resolve(response);
    });

    return deferred.promise;
  }
}

module.exports = scgi;
