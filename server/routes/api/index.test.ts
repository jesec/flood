import fastify from 'fastify';
import supertest from 'supertest';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';

import type {FloodSettings} from '../../../shared/types/FloodSettings';
import {defaultFloodSettings} from '../../../shared/schema/FloodSettings';
import {getAuthToken} from '../../util/authUtil';
import constructRoutes from '..';

vi.useRealTimers();

const app = fastify({disableRequestLogging: true, logger: false});
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

const settings: Partial<FloodSettings> = {
  startTorrentsOnLoad: false,
  torrentDestinations: {
    '': '/home/download/test',
  },
};

describe('PATCH /api/settings', () => {
  it('Adds settings', async () => {
    const res = await request
      .patch('/api/settings')
      .send(settings)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toStrictEqual({...defaultFloodSettings, ...settings});
  });
});

describe('GET /api/settings', () => {
  it('Gets all settings', async () => {
    const res = await request
      .get('/api/settings')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject(settings);
  });
});

describe('GET /api/settings/{property}', () => {
  Object.keys(settings).forEach((setting) => {
    it(`Gets property ${setting}`, async () => {
      const res = await request
        .get(`/api/settings/${setting}`)
        .send()
        .set('Cookie', [authToken])
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(settings).toMatchObject(res.body);
    });
  });
});
