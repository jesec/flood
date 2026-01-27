import fs from 'node:fs';
import type {Server} from 'node:http';
import type {Http2SecureServer} from 'node:http2';

import type {FastifyInstance} from 'fastify';
import fastify from 'fastify';

import config from '../../config';
import packageJSON from '../../package.json';
import constructRoutes from '../routes';
import {createLogger} from '../util/logger';

const startWebServer = async () => {
  const {ssl = false, floodServerHost: host, floodServerPort: port} = config;
  const serverLogger = createLogger('web-server');

  let instance: FastifyInstance<Http2SecureServer, any, any, any> | FastifyInstance<Server, any, any, any>;

  if (ssl) {
    if (!config.sslKey || !config.sslCert) {
      serverLogger.fatal('Cannot start HTTPS server, `sslKey` or `sslCert` is missing in config.js.');
      process.exit(1);
    }

    instance = fastify({
      bodyLimit: 100 * 1024 * 1024,
      trustProxy: 'loopback',
      loggerInstance: serverLogger,
      https: {
        key: fs.readFileSync(config.sslKey),
        cert: fs.readFileSync(config.sslCert),
      },
    });
  } else {
    instance = fastify({
      bodyLimit: 100 * 1024 * 1024,
      trustProxy: 'loopback',
      loggerInstance: serverLogger,
    });
  }

  await constructRoutes(instance);

  if (typeof port === 'string' && !/^\d+$/.test(port)) {
    await instance.listen({path: port});
  } else {
    await instance.listen({port: Number(port), host});
  }

  for (const addressObject of instance.addresses()) {
    let hostname = addressObject.address;
    if (addressObject.family == 'IPv6') {
      hostname = `[${addressObject.address}]`;
    }
    const url = `${ssl ? 'https' : 'http'}://${hostname}:${addressObject.port}`;

    instance.log.info({url, version: packageJSON.version}, 'Flood server listening');
  }

  if (config.authMethod === 'none') {
    instance.log.warn('Starting without builtin authentication');
  }

  if (config.serveAssets === false) {
    instance.log.info('Static assets not served');
  }
};

export default startWebServer;
