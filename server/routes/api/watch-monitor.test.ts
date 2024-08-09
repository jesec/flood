import fastify from 'fastify';
import fs from 'fs';
import supertest from 'supertest';

import constructRoutes from '..';
import {getAuthToken} from '../../util/authUtil';
import {getTempPath} from '../../models/TemporaryStorage';
import {WatchedDirectory} from '@shared/types/Watch';
import {AddWatchOptions, ModifyWatchOptions} from '@shared/types/api/watch-monitor';

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

const tempDirectory = getTempPath('download');
fs.mkdirSync(tempDirectory, {recursive: true});

const watchOptions: AddWatchOptions = {
  label: 'Watch Temp Directory',
  dir: tempDirectory,
  destination: 'dest',
  tags: ['tag']
};

let addedWatch: WatchedDirectory | null = null;
describe('GET /api/watch-monitor', () => {
  it('Expects nothing, yet. Verifies data structure.', (done) => {
    request
      .get('/api/watch-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const expectedResponse: WatchedDirectory[] = [];

        expect(res.body).toStrictEqual(expectedResponse);

        done();
      });
  });
});

describe('PUT /api/watch-monitor', () => {
  it('Watches a directory', (done) => {
    request
      .put('/api/watch-monitor')
      .send(watchOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const response: WatchedDirectory = res.body;

        expect(response).toMatchObject(watchOptions);

        expect(response._id).not.toBeNull();
        expect(typeof response._id).toBe('string');

        addedWatch = response;

        done();
      });
  });

  it('GET /api/watch-monitor to verify added watch', (done) => {
    request
      .get('/api/watch-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const expectedResponse = [addedWatch];

        expect(res.body).toStrictEqual(expectedResponse);

        done();
      });
  })
});

describe('PATCH /api/watch-monitor/{id}', () => {
  const modifyFeedOptions: ModifyWatchOptions = {
    label: 'Modified Feed',
  };

  it('Modifies the added feed', (done) => {
    expect(addedWatch).not.toBe(null);
    if (addedWatch == null) return;

    request
      .patch(`/api/watch-monitor/${addedWatch._id}`)
      .send(modifyFeedOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) {
          done(err);
          return;
        }

        done();
      });
  });

  it('GET /api/watch-monitor to verify modified feed', (done) => {
    expect(addedWatch).not.toBe(null);
    if (addedWatch == null) return;

    request
      .get(`/api/watch-monitor/${addedWatch._id}`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        addedWatch = {...(addedWatch as WatchedDirectory), ...modifyFeedOptions};

        expect(res.body).toStrictEqual([addedWatch]);

        done();
      });
  });
});

describe('DELETE /api/watch-monitor/{id}', () => {
  it('Deletes the added feed', (done) => {
    expect(addedWatch).not.toBe(null);
    if (addedWatch == null) return;

    request
      .delete(`/api/watch-monitor/${addedWatch._id}`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);

        done();
      });
  });

  it('GET /api/watch-monitor to verify watch has been deleted', (done) => {
    request
      .get('/api/watch-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const expectedResponse: WatchedDirectory[] = [];

        expect(res.body).toStrictEqual(expectedResponse);

        done();
      });
  });
});
