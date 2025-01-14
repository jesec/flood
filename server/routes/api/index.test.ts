import fastify from 'fastify';
import supertest from 'supertest';

import type {FloodSettings} from '../../../shared/types/FloodSettings';
import {getAuthToken} from '../../util/authUtil';
import constructRoutes from '..';

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
  it('Adds settings', (done) => {
    request
      .patch('/api/settings')
      .send(settings)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toStrictEqual(settings);

        done();
      });
  });
});

describe('GET /api/settings', () => {
  it('Gets all settings', (done) => {
    request
      .get('/api/settings')
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

describe('GET /api/settings/{property}', () => {
  Object.keys(settings).forEach((setting) => {
    it(`Gets property ${setting}`, (done) => {
      request
        .get(`/api/settings/${setting}`)
        .send()
        .set('Cookie', [authToken])
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) done(err);

          expect(settings).toMatchObject(res.body);

          done();
        });
    });
  });
});
