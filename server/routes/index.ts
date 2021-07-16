import fastifyExpress from 'fastify-express';
import fastifyStatic from 'fastify-static';
import fs from 'fs';
import path from 'path';

import type {FastifyInstance} from 'fastify';

import paths from '@shared/config/paths';

import apiRoutes from './api';
import config from '../../config';
import Users from '../models/Users';

const constructRoutes = async (app: FastifyInstance) => {
  await Users.bootstrapServicesForAllUsers();

  const servedPath = config.baseURI.endsWith('/') ? config.baseURI : `${config.baseURI}/`;

  if (config.serveAssets !== false) {
    const html = fs.readFileSync(path.join(paths.appDist, 'index.html'), {
      encoding: 'utf8',
    });

    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };

    app.get(`${servedPath}index.html`, (_request, reply) => {
      reply.code(200).type('text/html').headers(headers).send(html);
    });

    app.get(`${servedPath}login`, (_request, reply) => {
      reply.code(200).type('text/html').headers(headers).send(html);
    });

    app.get(`${servedPath}register`, (_request, reply) => {
      reply.code(200).type('text/html').headers(headers).send(html);
    });

    app.get(`${servedPath}overview`, (_request, reply) => {
      reply.code(200).type('text/html').headers(headers).send(html);
    });

    await app.register(fastifyStatic, {root: paths.appDist, prefix: servedPath});
  }

  await app.register(fastifyExpress);

  app.use(`${servedPath}api`, apiRoutes);
};

export default constructRoutes;
