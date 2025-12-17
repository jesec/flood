import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';

import fastify from 'fastify';
import supertest from 'supertest';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

import type {ClientSettings} from '../../../shared/types/ClientSettings';
import {getAuthToken} from '../../util/authUtil';
import constructRoutes from '..';

const app = fastify({disableRequestLogging: true, logger: true});
let request: supertest.SuperTest<supertest.Test>;

beforeAll(async () => {
  await constructRoutes(app);
  await app.ready();
  request = supertest(app.server);
});

afterAll(async () => {
  await app.close();
});

const authToken = `jwt=${getAuthToken('_config')}`;

describe('GET /api/client/connection-test', () => {
  it('Checks connection status', async () => {
    const res = await request
      .get('/api/client/connection-test')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({isConnected: true});
  });
});

const settings: Partial<ClientSettings> = {
  throttleGlobalDownSpeed: 2048 * 1024,
  throttleGlobalUpSpeed: 2048 * 1024,
};

describe('PATCH /api/client/settings', () => {
  it('Sets client settings', async () => {
    await request
      .patch('/api/client/settings')
      .send(settings)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);
  });
});

describe('GET /api/client/settings', () => {
  it('Gets all client settings', async () => {
    const res = await request
      .get('/api/client/settings')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject(settings);
  });
});
