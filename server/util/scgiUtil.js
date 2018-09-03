const Deserializer = require('xmlrpc/lib/deserializer');
const net = require('net');
const Serializer = require('xmlrpc/lib/serializer');

const NULL_CHAR = String.fromCharCode(0);

const methodCall = (connectionMethod, methodName, parameters) => {
  return new Promise((resolve, reject) => {
    const networkConfiguration = connectionMethod.socket
      ? {path: connectionMethod.socketPath}
      : {port: connectionMethod.port, host: connectionMethod.host};

    const deserializer = new Deserializer('utf8');
    const stream = net.connect(networkConfiguration);
    const xml = Serializer.serializeMethodCall(methodName, parameters);
    const xmlLength = Buffer.byteLength(xml, 'utf8');

    stream.setEncoding('UTF8');

    const headerItems = [`CONTENT_LENGTH${NULL_CHAR}${xmlLength}${NULL_CHAR}`, `SCGI${NULL_CHAR}1${NULL_CHAR}`];

    const headerLength = headerItems.reduce((accumulator, headerItem) => {
      return (accumulator += headerItem.length);
    }, 0);

    stream.write(`${headerLength}:${headerItems.join('')},${xml}`);

    deserializer.deserializeMethodResponse(stream, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
};

module.exports = {methodCall};
