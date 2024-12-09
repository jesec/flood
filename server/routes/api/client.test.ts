import fastify from 'fastify';
import supertest from 'supertest';

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

jest.setTimeout(20000);

describe('GET /api/client/connection-test', () => {
  it('Checks connection status', (done) => {
    request
      .get('/api/client/connection-test')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toMatchObject({isConnected: true});

        done();
      });
  });
});

const settings: Partial<ClientSettings> = {
  throttleGlobalDownSpeed: 2048 * 1024,
  throttleGlobalUpSpeed: 2048 * 1024,
};

describe('PATCH /api/client/settings', () => {
  it('Sets client settings', (done) => {
    request
      .patch('/api/client/settings')
      .send(settings)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });
});

describe('GET /api/client/settings', () => {
  it('Gets all client settings', (done) => {
    request
      .get('/api/client/settings')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toMatchObject(settings);

        done();
      });
  });
});
