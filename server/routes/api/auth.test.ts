import crypto from 'crypto';
import fs from 'fs';
import supertest from 'supertest';

import {AccessLevel} from '../../../shared/schema/Auth';

import app from '../../app';
import {dbPath} from '../../../config';

import type {AuthAuthenticationResponse, AuthRegistrationOptions} from '../../../shared/schema/api/auth';
import type {ClientConnectionSettings} from '../../../shared/schema/ClientConnectionSettings';

// Clear database before starting the test
fs.rmdirSync(dbPath, {recursive: true});

const request = supertest(app);

const testConnectionSettings: ClientConnectionSettings = {
  client: 'rTorrent',
  type: 'socket',
  version: 1,
  socket: '/home/download/rtorrent.sock',
};

const testAdminUser = {
  username: crypto.randomBytes(8).toString('hex'),
  password: crypto.randomBytes(30).toString('hex'),
  client: testConnectionSettings,
  level: AccessLevel.ADMINISTRATOR,
} as const;
let testAdminUserToken = '';

const testNonAdminUser = {
  username: crypto.randomBytes(8).toString('hex'),
  password: crypto.randomBytes(30).toString('hex'),
  client: testConnectionSettings,
  level: AccessLevel.USER,
} as const;
let testNonAdminUserToken = '';

describe('POST /api/auth/register', () => {
  it('Register initial user', (done) => {
    const options: AuthRegistrationOptions = testAdminUser;
    request
      .post('/api/auth/register')
      .send(options)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const authResponse: AuthAuthenticationResponse = res.body;

        expect(typeof authResponse.token === 'string').toBe(true);
        expect(authResponse.token.includes('JWT')).toBe(true);

        [, testAdminUserToken] = authResponse.token.split('JWT ');

        done();
      });
  });

  it('Register subsequent user with no credential', (done) => {
    const options: AuthRegistrationOptions = testNonAdminUser;
    request
      .post('/api/auth/register')
      .send(options)
      .set('Accept', 'application/json')
      .expect(401)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Register subsequent user with admin credentials', (done) => {
    const options: AuthRegistrationOptions = testNonAdminUser;
    request
      .post('/api/auth/register')
      .send(options)
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Set-Cookie', /jwt/)
      .end((err, res) => {
        if (err) done(err);

        const authResponse: AuthAuthenticationResponse = res.body;

        expect(typeof authResponse.token === 'string').toBe(true);
        expect(authResponse.token.includes('JWT')).toBe(true);

        [, testNonAdminUserToken] = authResponse.token.split('JWT ');

        done();
      });
  });

  it('Register subsequent user with non-admin credentials', (done) => {
    const options: AuthRegistrationOptions = testNonAdminUser;
    request
      .post('/api/auth/register')
      .send(options)
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testNonAdminUserToken}`])
      .expect(403)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Register duplicate user with admin credentials', (done) => {
    const options: AuthRegistrationOptions = testNonAdminUser;
    request
      .post('/api/auth/register')
      .send(options)
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(500)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Register subsequent user with admin credentials expecting no cookie', (done) => {
    const options: AuthRegistrationOptions = {
      ...testNonAdminUser,
      username: crypto.randomBytes(8).toString('hex'),
    };
    request
      .post('/api/auth/register?cookie=false')
      .send(options)
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.headers['set-cookie']).toBeUndefined();

        done();
      });
  });
});

describe('POST /api/auth/authenticate', () => {
  it('Authenticate with no credential', (done) => {
    request
      .post('/api/auth/authenticate')
      .send({
        username: 'root',
      })
      .set('Accept', 'application/json')
      .expect(422)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Authenticate with wrong credentials', (done) => {
    request
      .post('/api/auth/authenticate')
      .send({
        username: 'root',
        password: 'admin',
      })
      .set('Accept', 'application/json')
      .expect(401)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Authenticate with correct credentials', (done) => {
    request
      .post('/api/auth/authenticate')
      .send({
        username: testAdminUser.username,
        password: testAdminUser.password,
      })
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Set-Cookie', /jwt/)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });
});
