import chalk from 'chalk';
import fastify, {FastifyRequest} from 'fastify';
import fs from 'fs';

import type {FastifyInstance} from 'fastify';
import fastifyPassport from '@fastify/passport';
import {Strategy} from 'passport-jwt';
import {fastifyCookie} from '@fastify/cookie';
import config from '../../config';
import constructRoutes from '../routes';
import packageJSON from '../../package.json';
import express from 'express';
import {authTokenSchema, UserInDatabase} from '@shared/schema/Auth';
import Users from '../models/Users';
import {fastifySession} from '@fastify/session';
import {FloodSettings} from '@shared/types/FloodSettings';
import {getAllServices, ServiceInstances} from '../services';
import {FailedInitializeResponseError} from '../routes/error';
import {ClientSettings} from '@shared/types/ClientSettings';

declare module 'fastify' {
  interface FastifyRequest {
    services: ServiceInstances;
  }

  interface PassportUser extends UserInDatabase {}
}

const startWebServer = async () => {
  await Users.bootstrapServicesForAllUsers();
  const {ssl = false, floodServerHost: host, floodServerPort: port} = config;

  let instance: FastifyInstance;

  if (ssl) {
    if (!config.sslKey || !config.sslCert) {
      console.error('Cannot start HTTPS server, `sslKey` or `sslCert` is missing in config.js.');
      process.exit(1);
    }

    instance = fastify({
      bodyLimit: 100 * 1024 * 1024,
      trustProxy: 'loopback',
      http2: true,
      https: {
        allowHTTP1: true,
        key: fs.readFileSync(config.sslKey),
        cert: fs.readFileSync(config.sslCert),
      },
    }) as unknown as FastifyInstance;
  } else {
    instance = fastify({
      bodyLimit: 100 * 1024 * 1024,
      trustProxy: 'loopback',
    });
  }

  const servedPath = config.baseURI.endsWith('/') ? config.baseURI.slice(0, config.baseURI.length - 1) : config.baseURI;

  await instance.register(
    async (app) => {
      await app.register(fastifyCookie);
      await app.register(fastifySession, {secret: config.secret});
      await app.register(fastifyPassport.initialize());
      await app.register(fastifyPassport.secureSession());

      fastifyPassport.use(
        new Strategy(
          {
            jwtFromRequest: (req: express.Request) => req?.cookies?.jwt,
            secretOrKey: config.secret,
          },
          (payload, callback) => {
            const parsedResult = authTokenSchema.safeParse(payload);

            if (!parsedResult.success) {
              callback(parsedResult.error, false);
              return;
            }

            Users.lookupUser(parsedResult.data.username).then(
              (user) => {
                if (user?.timestamp <= parsedResult.data.iat + 10) {
                  callback(null, user);
                } else {
                  callback(new Error(), false);
                }
              },
              (err) => {
                callback(err, false);
              },
            );
          },
        ),
      );

      app.addHook('preHandler', fastifyPassport.authenticate('jwt', {session: false}));

      app.addHook('preHandler', async (req: FastifyRequest) => {
        if (req.user === undefined || req.user === null) {
          throw new FailedInitializeResponseError();
        }
        req.services = getAllServices(req.user);
        if (req.services?.clientGatewayService == null) {
          throw FailedInitializeResponseError();
        }
      });

      /**
       * GET /api/settings
       * @summary Gets all Flood's settings
       * @tags Flood
       * @security User
       */
      app.get('/api/settings', {}, async function (req): Promise<Partial<FloodSettings>> {
        return await req.services.settingService.get(null);
      });

      /**
       * GET /api/client/settings
       * @summary Gets settings of torrent client managed by Flood.
       * @tags Client
       * @security User
       */
      app.get('/api/client/settings', async (req): Promise<ClientSettings> => {
        return await req.services.clientGatewayService.getClientSettings();
      });
    },
    {prefix: servedPath},
  );

  await constructRoutes(instance as FastifyInstance);

  await instance.listen({port, host});

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
