import chalk from 'chalk';
import fastify, {FastifyHttpsOptions, FastifyRequest, FastifyServerOptions} from 'fastify';
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
import * as https from 'https';
import {setupApiRouters} from '../routes/api/index2';
import {setupClientRoutes} from '../routes/api/client2';

declare module 'fastify' {
  interface FastifyRequest {
    services: ServiceInstances;
  }

  interface PassportUser extends UserInDatabase {}
}

export async function createWebApp(opt: FastifyServerOptions = {}): Promise<FastifyInstance> {
  await Users.bootstrapServicesForAllUsers();
  let instance = fastify(opt);

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

      await app.register(setupApiRouters);
      await app.register(setupClientRoutes);
    },
    {prefix: servedPath},
  );

  await constructRoutes(instance);

  return instance;
}

const startWebServer = async () => {
  const {ssl = false, floodServerHost: host, floodServerPort: port} = config;

  const opt: FastifyServerOptions & {
    http2?: boolean;
  } & Partial<Pick<FastifyHttpsOptions<https.Server>, 'https'>> = {
    bodyLimit: 100 * 1024 * 1024,
    trustProxy: 'loopback',
  };

  if (ssl) {
    if (!config.sslKey || !config.sslCert) {
      console.error('Cannot start HTTPS server, `sslKey` or `sslCert` is missing in config.js.');
      process.exit(1);
    }

    opt.http2 = true;
    opt.https = {
      key: fs.readFileSync(config.sslKey),
      cert: fs.readFileSync(config.sslCert),
      // this option is documented but not typed
      // https://nodejs.org/api/http2.html#http2createsecureserveroptions-onrequesthandler
      // @ts-ignore
      allowHTTP1: true,
    };
  }

  const app = await createWebApp(opt);

  await app.listen({port, host});
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
