import crypto from 'node:crypto';

import fastify from 'fastify';
import supertest from 'supertest';

import type {
  AuthRegistrationOptions,
  AuthUpdateUserOptions,
  AuthVerificationResponse,
} from '../../../shared/schema/api/auth';
import type {ClientConnectionSettings} from '../../../shared/schema/ClientConnectionSettings';
import {AccessLevel} from '../../../shared/schema/constants/Auth';
import {getAuthToken} from '../../util/authUtil';
import constructRoutes from '..';

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
        expect(verificationResponse.configs).toBeDefined();

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
      .expect('Set-Cookie', /jwt=.*;/)
      .end((err, res) => {
        if (err) done(err);

        [testAdminUserToken] = res.headers['set-cookie'];
        expect(typeof testAdminUserToken).toBe('string');

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
      .set('Cookie', [testAdminUserToken])
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Set-Cookie', /jwt=.*;/)
      .end((err, res) => {
        if (err) done(err);

        [testNonAdminUserToken] = res.headers['set-cookie'];
        expect(typeof testNonAdminUserToken).toBe('string');

        done();
      });
  });

  it('Register subsequent user with non-admin credentials', (done) => {
    const options: AuthRegistrationOptions = testNonAdminUser;
    request
      .post('/api/auth/register')
      .send(options)
      .set('Accept', 'application/json')
      .set('Cookie', [testNonAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
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
      .expect(401)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body.configs).toBeDefined();

        done();
      });
  });

  it('Verify with valid credentials', (done) => {
    request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(200)
      .end((err, res) => {
        if (err) done(err);

        const verificationResponse: AuthVerificationResponse = res.body;

        expect(verificationResponse.initialUser).toBe(false);

        if (verificationResponse.initialUser === false) {
          expect(verificationResponse.level).toBe(testAdminUser.level);
          expect(verificationResponse.username).toBe(testAdminUser.username);
        }

        expect(verificationResponse.configs).toBeDefined();

        done();
      });
  });

  it('Verify with wrong credentials generated by server secret', (done) => {
    request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${getAuthToken('nonExistentUser')}`])
      .expect(401)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body.configs).toBeDefined();

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
      .set('Cookie', [testAdminUserToken])
      .expect(200)
      .expect('Set-Cookie', /jwt=;/)
      .end((err, _res) => {
        if (err) done(err);
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
      .set('Cookie', [testNonAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
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
      .set('Cookie', [testNonAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
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
      .set('Cookie', [testNonAdminUserToken])
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
      .set('Cookie', [testAdminUserToken])
      .expect(200)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body.username).toBe(testNonAdminUser.username);

        done();
      });
  });
});
