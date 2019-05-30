const net = require('net');
const Serializer = require('xmlrpc/lib/serializer');
const rTorrentDeserializer = require('./rTorrentDeserializer');

const NULL_CHAR = String.fromCharCode(0);

const bufferStream = stream => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

const methodCall = (connectionMethod, methodName, parameters) =>
  new Promise((resolve, reject) => {
    const networkConfiguration =
      connectionMethod.socketPath != null
        ? {path: connectionMethod.socketPath}
        : {port: connectionMethod.port, host: connectionMethod.host};

    const stream = net.connect(networkConfiguration);
    const xml = Serializer.serializeMethodCall(methodName, parameters);
    const xmlLength = Buffer.byteLength(xml, 'utf8');

    stream.setEncoding('UTF8');

    const headerItems = [`CONTENT_LENGTH${NULL_CHAR}${xmlLength}${NULL_CHAR}`, `SCGI${NULL_CHAR}1${NULL_CHAR}`];

    const headerLength = headerItems.reduce((accumulator, headerItem) => accumulator + headerItem.length, 0);

    stream.write(`${headerLength}:${headerItems.join('')},${xml}`);

    bufferStream(stream).then(data => {
      rTorrentDeserializer.deserialize(data, resolve, reject);
    });
  });

module.exports = {methodCall};
