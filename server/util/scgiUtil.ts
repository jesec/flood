import net from 'net';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Serializer from 'xmlrpc/lib/serializer';
import rTorrentDeserializer from './rTorrentDeserializer';

const NULL_CHAR = String.fromCharCode(0);

const bufferStream = (stream: net.Socket) => {
  const chunks: Array<Buffer> = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

const methodCall = (
  connectionMethod: {socketPath?: string; host?: string; port?: number},
  methodName: string,
  parameters: Array<string>,
) =>
  new Promise((resolve, reject) => {
    let stream: net.Socket | null = null;

    if (connectionMethod.socketPath != null) {
      stream = net.connect(connectionMethod.socketPath);
    } else if (connectionMethod.port != null && connectionMethod.host != null) {
      stream = net.connect(connectionMethod.port, connectionMethod.host);
    } else {
      return;
    }

    const xml = Serializer.serializeMethodCall(methodName, parameters);
    const xmlLength = Buffer.byteLength(xml, 'utf8');

    stream.on('error', reject);
    stream.setEncoding('UTF8');

    const headerItems = [`CONTENT_LENGTH${NULL_CHAR}${xmlLength}${NULL_CHAR}`, `SCGI${NULL_CHAR}1${NULL_CHAR}`];

    const headerLength = headerItems.reduce((accumulator, headerItem) => accumulator + headerItem.length, 0);

    stream.end(`${headerLength}:${headerItems.join('')},${xml}`);

    bufferStream(stream)
      .then((data) => {
        rTorrentDeserializer.deserialize(data as string, resolve, reject);
      })
      .catch(reject);
  });

export default {methodCall};
