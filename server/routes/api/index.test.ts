import supertest from 'supertest';

import app from '../../app';
import {getAuthToken} from './auth';

import type {FloodSettings} from '../../../shared/types/FloodSettings';

const request = supertest(app);

const authToken = `jwt=${getAuthToken('_config')}`;

const settings: Partial<FloodSettings> = {
  startTorrentsOnLoad: false,
  torrentDestination: '/home/download/test',
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
