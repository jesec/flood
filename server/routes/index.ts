import fs from 'node:fs';
import path from 'node:path';

import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import paths from '@shared/config/paths';
import {authTokenSchema} from '@shared/schema/Auth';
import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';

import config from '../../config';
import appendUserServices from '../middleware/appendUserServices';
import requireAdmin from '../middleware/requireAdmin';
import Users from '../models/Users';
import {verifyToken} from '../util/authUtil';
import apiRoutes from './api';

const unauthorized = (reply: FastifyReply) => reply.status(401).send('Unauthorized');

const constructRoutes = async (fastify: FastifyInstance) => {
  await Users.bootstrapServicesForAllUsers();

  const servedPath = config.baseURI.endsWith('/') ? config.baseURI : `${config.baseURI}/`;

  await fastify.register(fastifyCompress);
  await fastify.register(fastifyCookie);
  await fastify.register(fastifyRateLimit, {global: false});

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (request.user != null && request.services != null) {
      return;
    }

    const token = request.cookies?.jwt;
    const payload = token != null ? await verifyToken(token).catch(() => undefined) : undefined;
    if (payload == null) {
      unauthorized(reply);
      return;
    }

    const parsedResult = authTokenSchema.safeParse(payload);

    if (!parsedResult.success) {
      unauthorized(reply);
      return;
    }

    const user = await Users.lookupUser(parsedResult.data.username);
    if (user?.timestamp > parsedResult.data.iat + 10 || user == null) {
      unauthorized(reply);
      return;
    }

    request.user = user;
    const response = appendUserServices(request, reply);
    if (response) {
      return;
    }
  });

  fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!requireAdmin(request)) {
      reply.status(403).send({message: 'User is not admin.'});
    }
  });

  if (config.serveAssets !== false) {
    fastify.register(fastifyStatic, {root: paths.appDist, prefix: servedPath});

    const html = fs.readFileSync(path.join(paths.appDist, 'index.html'), {
      encoding: 'utf8',
    });

    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'content-type': 'text/html; charset=UTF-8',
    };

    fastify.get(`${servedPath}login`, (_req, res) => {
      res.headers(headers);
      res.send(html);
    });

    fastify.get(`${servedPath}register`, (_req, res) => {
      res.headers(headers);
      res.send(html);
    });

    fastify.get(`${servedPath}overview`, (_req, res) => {
      res.headers(headers);
      res.send(html);
    });
  }

  await fastify.register(apiRoutes, {prefix: `${servedPath}api`});
};

export default constructRoutes;
