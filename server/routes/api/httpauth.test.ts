import crypto from 'crypto';
import supertest from 'supertest';

import {AccessLevel} from '../../../shared/schema/Auth';

import app from '../../app';
import {getAuthToken} from './auth';

import type {
  AuthAuthenticationResponse,
  AuthRegistrationOptions,
  AuthUpdateUserOptions,
  AuthVerificationResponse,
} from '../../../shared/schema/api/auth';
import type {ClientConnectionSettings} from '../../../shared/schema/ClientConnectionSettings';

jest.setTimeout(20000);
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
const testAdminHTTPBasicAuth = `Basic ${Buffer.from(`${testAdminUser.username}:${testAdminUser.password}`).toString(
  'base64',
)}`;
const testNotExstingTTPBasicAuth = `Basic ${Buffer.from('notExstingUser:password').toString('base64')}`;

const testNonAdminUser = {
  username: crypto.randomBytes(8).toString('hex'),
  password: crypto.randomBytes(30).toString('hex'),
  client: testConnectionSettings,
  level: AccessLevel.USER,
} as const;
let testNonAdminUserToken = '';

describe('GET /api/auth/verify (initial)', () => {
  it('Verify without credential', (done) => {
    request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const verificationResponse: AuthVerificationResponse = res.body;

        expect(verificationResponse.initialUser).toBe(true);

        done();
      });
  });
});

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
      .end((err, res) => {
        if (err) done(err);

        expect(res.headers['set-cookie']).toBeUndefined();

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
      .end((err, res) => {
        if (err) done(err);

        expect(res.headers['set-cookie']).toBeUndefined();

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
      .end((err, res) => {
        if (err) done(err);

        expect(res.headers['set-cookie']).toBeUndefined();

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

  it('Register subsequent user with admin credentials and malformed data', (done) => {
    request
      .post('/api/auth/register')
      .send({
        ...testNonAdminUser,
        client: {
          ...testNonAdminUser.client,
          client: 'not a client',
        },
      })
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(422)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.headers['set-cookie']).toBeUndefined();

        done();
      });
  });
});

describe('GET /api/auth/verify', () => {
  it('Verify without credential', (done) => {
    request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .expect(422)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.headers['set-cookie']).toBeUndefined();

        done();
      });
  });

  it('Verify with valid credentials', (done) => {
    request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(422)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.headers['set-cookie']).toBeUndefined();

        done();
      });
  });

  it('Verify with valid credentials from http basic auth', (done) => {
    request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .set('Authorization', testAdminHTTPBasicAuth)
      .expect(200)
      .end((err, res) => {
        if (err) done(err);

        const verificationResponse: AuthVerificationResponse = res.body;

        expect(verificationResponse.initialUser).toBe(false);

        if (verificationResponse.initialUser === false) {
          expect(verificationResponse.level).toBe(testAdminUser.level);
          expect(verificationResponse.username).toBe(testAdminUser.username);
        }

        done();
      });
  });

  it('Verify with wrong credentials generated by server secret', (done) => {
    request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .set('Authorization', 'notValidAuthorizationHeader')
      .expect(422)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.headers['set-cookie']).toBeUndefined();

        done();
      });
  });

  it('Verify with wrong credentials from http basic auth', (done) => {
    request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${getAuthToken('nonExistentUser')}`])
      .set('Authorization', testNotExstingTTPBasicAuth)
      .expect(401)
      .end((err, _res) => {
        if (err) done(err);

        done();
      });
  });
});

describe('GET /api/auth/logout', () => {
  it('Logouts with credentials', (done) => {
    request
      .get('/api/auth/logout')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(401)
      .expect('Set-Cookie', /jwt=;/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toBe('Unauthorized');

        done();
      });
  });

  it('Logouts with http basic auth', (done) => {
    request
      .get('/api/auth/logout')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .set('Authorization', testAdminHTTPBasicAuth)
      .expect(401)
      .expect('Set-Cookie', /jwt=;/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toBe('Unauthorized');

        done();
      });
  });

  it('Logouts without credential', (done) => {
    request
      .get('/api/auth/logout')
      .send()
      .set('Accept', 'application/json')
      .expect(401)
      .end((err, _res) => {
        if (err) done(err);
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
      .expect(422)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Authenticate with wrong credentials from http basic auth', (done) => {
    request
      .post('/api/auth/authenticate')
      .set('Accept', 'application/json')
      .set('Authorization', testNotExstingTTPBasicAuth)
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
      .expect(422)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Authenticate with correct credentials from http basic auth', (done) => {
    request
      .post('/api/auth/authenticate')
      .set('Authorization', testAdminHTTPBasicAuth)
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

describe('GET /api/auth/users', () => {
  it('Lists user without credential', (done) => {
    request
      .get('/api/auth/users')
      .send()
      .set('Accept', 'application/json')
      .expect(401)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Lists user with non-admin credentials', (done) => {
    request
      .get('/api/auth/users')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testNonAdminUserToken}`])
      .expect(403)
      .end((err, res) => {
        if (err) done(err);

        expect(Array.isArray(res.body)).toBe(false);

        done();
      });
  });

  it('Lists user with admin credentials', (done) => {
    request
      .get('/api/auth/users')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(200)
      .end((err, res) => {
        if (err) done(err);

        expect(Array.isArray(res.body)).toBe(true);
        expect(typeof res.body[0].username).toBe('string');

        done();
      });
  });
});

describe('PATCH /api/auth/users/{username}', () => {
  const patch: AuthUpdateUserOptions = {
    client: {
      client: 'rTorrent',
      type: 'socket',
      version: 1,
      socket: 'test',
    },
  };

  it('Updates a nonexistent user with admin credentials', (done) => {
    request
      .patch(`/api/auth/users/${`nonExistentUser`}`)
      .send(patch)
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(500)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Updates an existing user with non-admin credentials', (done) => {
    request
      .patch(`/api/auth/users/${testAdminUser.username}`)
      .send(patch)
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testNonAdminUserToken}`])
      .expect(403)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Updates an existing user with admin credentials', (done) => {
    request
      .patch(`/api/auth/users/${testNonAdminUser.username}`)
      .send(patch)
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(200)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Updates an existing user with admin credentials and malformed data', (done) => {
    request
      .patch(`/api/auth/users/${testNonAdminUser.username}`)
      .send({
        client: {
          ...patch.client,
          client: 'notClient',
        },
      })
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(422)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });
});

describe('DELETE /api/auth/users/{username}', () => {
  it('Deletes a nonexistent user with admin credentials', (done) => {
    request
      .delete(`/api/auth/users/${`nonExistentUser`}`)
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(500)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Deletes an existing user with non-admin credentials', (done) => {
    request
      .delete(`/api/auth/users/${testAdminUser.username}`)
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testNonAdminUserToken}`])
      .expect(403)
      .end((err, _res) => {
        if (err) done(err);
        done();
      });
  });

  it('Deletes an existing user with admin credentials', (done) => {
    request
      .delete(`/api/auth/users/${testNonAdminUser.username}`)
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${testAdminUserToken}`])
      .expect(200)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body.username).toBe(testNonAdminUser.username);

        done();
      });
  });
});
