import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import fastifyStatic from '@fastify/static';
import type {FastifyInstance, FastifyReply} from 'fastify';

import config from '../../config';

type EmbeddedAssets = Record<string, {type: string; bodyBase64: string}>;

type DecodedEmbeddedAssets = Record<string, {type: string; body: Buffer}>;

// server frontend from embed static fiels
const registerEmbeddedClientAppAssetsRoutes = async (
  fastify: FastifyInstance,
  options: {embeddedAssets: EmbeddedAssets},
): Promise<void> => {
  const {embeddedAssets} = options;

  const decodedAssets: DecodedEmbeddedAssets = {};
  for (const [assetPath, asset] of Object.entries(embeddedAssets)) {
    decodedAssets[assetPath] = {
      type: asset.type,
      body: Buffer.from(asset.bodyBase64, 'base64'),
    };
  }

  const decodeAssetPath = (rawPath: string): string => {
    try {
      return decodeURIComponent(rawPath);
    } catch {
      return rawPath;
    }
  };

  const getEmbeddedAsset = (assetPath: string) => {
    const normalizedPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    return decodedAssets[normalizedPath];
  };

  const sendEmbedded = (assetPath: string, reply: FastifyReply) => {
    const asset = getEmbeddedAsset(assetPath);
    if (!asset) {
      return false;
    }

    const isIndexHtml = assetPath === 'index.html' || assetPath === '/index.html';

    if (isIndexHtml) {
      reply.headers({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Expires: '0',
        Pragma: 'no-cache',
        'content-type': 'text/html; charset=UTF-8',
      });
    } else {
      reply.header('content-type', asset.type);
      reply.header('Cache-Control', 'public, max-age=31536000, immutable');
    }

    reply.send(asset.body);
    return true;
  };

  const sendIndex = (_req: unknown, res: FastifyReply) => {
    if (!sendEmbedded('index.html', res)) {
      res.callNotFound();
    }
  };

  fastify.get('/', sendIndex);
  fastify.get('/index.html', sendIndex);
  fastify.get('/login', sendIndex);
  fastify.get('/register', sendIndex);
  fastify.get('/overview', sendIndex);

  fastify.get<{Params: {'*': string}}>('/*', (request, reply) => {
    const relativePath = decodeAssetPath((request.params as {['*']: string})['*']);

    if (
      relativePath === '' ||
      relativePath === '/' ||
      relativePath === 'login' ||
      relativePath === 'register' ||
      relativePath === 'overview'
    ) {
      sendIndex(request, reply);
      return;
    }

    sendEmbedded(relativePath, reply);
  });
};

// for developing
const registerStaticClientAppAssetsRoutes = async (fastify: FastifyInstance): Promise<void> => {
  const assetsDist = path.resolve(fileURLToPath(import.meta.url), '../../../dist/assets/');

  await fastify.register(fastifyStatic, {root: assetsDist, prefix: '/', etag: false});

  const indexPath = path.join(assetsDist, 'index.html');
  const sendIndex = (_req: unknown, res: FastifyReply) => {
    if (!fs.existsSync(indexPath)) {
      res.callNotFound();
      return;
    }

    const html = fs.readFileSync(indexPath, {
      encoding: 'utf8',
    });

    res.headers({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Expires: '0',
      Pragma: 'no-cache',
      'content-type': 'text/html; charset=UTF-8',
    });

    res.send(html);
  };

  fastify.get('/login', sendIndex);
  fastify.get('/register', sendIndex);
  fastify.get('/overview', sendIndex);
};

export const registerClientAppAssetsRoutes = async (fastify: FastifyInstance): Promise<void> => {
  if (config.serveAssets === false) {
    return;
  }

  const embeddedAssets: EmbeddedAssets | undefined =
    typeof __FLOOD_EMBEDDED_ASSETS__ === 'undefined' ? undefined : (__FLOOD_EMBEDDED_ASSETS__ as EmbeddedAssets);

  if (embeddedAssets) {
    return await registerEmbeddedClientAppAssetsRoutes(fastify, {embeddedAssets});
  }

  await registerStaticClientAppAssetsRoutes(fastify);
};
