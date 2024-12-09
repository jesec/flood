import fs from 'node:fs';
import type {Server} from 'node:http';
import type {Http2SecureServer} from 'node:http2';

import chalk from 'chalk';
import type {FastifyInstance} from 'fastify';
import fastify from 'fastify';

import config from '../../config';
import packageJSON from '../../package.json';
import constructRoutes from '../routes';

const startWebServer = async () => {
  const {ssl = false, floodServerHost: host, floodServerPort: port} = config;

  let instance: FastifyInstance<Http2SecureServer> | FastifyInstance<Server>;

  if (ssl) {
    if (!config.sslKey || !config.sslCert) {
      console.error('Cannot start HTTPS server, `sslKey` or `sslCert` is missing in config.js.');
      process.exit(1);
    }

    instance = fastify({
      bodyLimit: 100 * 1024 * 1024,
      trustProxy: 'loopback',
      https: {
        key: fs.readFileSync(config.sslKey),
        cert: fs.readFileSync(config.sslCert),
      },
    });
  } else {
    instance = fastify({
      bodyLimit: 100 * 1024 * 1024,
      trustProxy: 'loopback',
    });
  }

  await constructRoutes(instance as FastifyInstance);

  if (typeof port === 'string' && !/^\d+$/.test(port)) {
    await instance.listen({path: port});
  } else {
    await instance.listen({port: Number(port), host});
  }
  const address = chalk.underline(`${ssl ? 'https' : 'http'}://${host}:${port}`);

  console.log(chalk.green(`Flood server ${packageJSON.version} starting on ${address}\n`));

  if (config.authMethod === 'none') {
    console.log(chalk.yellow('Starting without builtin authentication\n'));
  }

  if (config.serveAssets === false) {
    console.log(chalk.blue('Static assets not served\n'));
  }
};

export default startWebServer;
