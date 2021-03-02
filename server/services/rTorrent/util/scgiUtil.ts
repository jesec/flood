import net from 'net';
import deserializer from './XMLRPCDeserializer';
import serializer, {XMLRPCValue} from './XMLRPCSerializer';

const NULL_CHAR = String.fromCharCode(0);

const bufferStream = (stream: net.Socket): Promise<string> => {
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

const methodCall = (options: net.NetConnectOpts, methodName: string, params: XMLRPCValue[]) =>
  // TODO: better typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new Promise<any>((resolve, reject) => {
    const stream = net.connect(options);
    const xml = serializer.serializeSync(methodName, params);
    const xmlLength = Buffer.byteLength(xml, 'utf8');

    stream.on('error', reject);
    stream.setEncoding('UTF8');

    const headerItems = [
      `CONTENT_LENGTH${NULL_CHAR}${xmlLength}${NULL_CHAR}`,
      `CONTENT_TYPE${NULL_CHAR}text/xml${NULL_CHAR}`,
      `SCGI${NULL_CHAR}1${NULL_CHAR}`,
    ];

    const headerLength = headerItems.reduce((accumulator, headerItem) => accumulator + headerItem.length, 0);

    stream.end(`${headerLength}:${headerItems.join('')},${xml}`);

    bufferStream(stream)
      .then((data) => deserializer.deserialize(data))
      .then(resolve, reject);
  });

export default {methodCall};
