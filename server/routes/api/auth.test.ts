import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
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

vi.useRealTimers();

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
describe('GET /api/auth/verify (initial)', () => {
  it('Verify without credential', async () => {
    const res = await request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    const verificationResponse: AuthVerificationResponse = res.body;

    expect(verificationResponse.initialUser).toBe(true);
    expect(verificationResponse.configs).toBeDefined();
  });
});

describe('POST /api/auth/register', () => {
  it('Register initial user', async () => {
    const options: AuthRegistrationOptions = testAdminUser;
    const res = await request
      .post('/api/auth/register')
      .send(options)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Set-Cookie', /jwt=.*;/);

    [testAdminUserToken] = res.headers['set-cookie'];
    expect(typeof testAdminUserToken).toBe('string');
  });

  it('Register subsequent user with no credential', async () => {
    const options: AuthRegistrationOptions = testNonAdminUser;
    const res = await request.post('/api/auth/register').send(options).set('Accept', 'application/json').expect(401);

    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('Register subsequent user with admin credentials', async () => {
    const options: AuthRegistrationOptions = testNonAdminUser;
    const res = await request
      .post('/api/auth/register')
      .send(options)
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Set-Cookie', /jwt=.*;/);

    [testNonAdminUserToken] = res.headers['set-cookie'];
    expect(typeof testNonAdminUserToken).toBe('string');
  });

  it('Register subsequent user with admin credentials expecting no cookie', async () => {
    const options: AuthRegistrationOptions = {
      ...testNonAdminUser,
      username: crypto.randomBytes(8).toString('hex'),
    };
    const res = await request
      .post('/api/auth/register?cookie=false')
      .send(options)
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('Register subsequent user with admin credentials and malformed data', async () => {
    const res = await request
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
      .expect(function (response) {
        if (response.status != 400) {
          console.log(JSON.stringify(response.body, null, 2));
        }
      })
      .expect(400)
      .expect('Content-Type', /json/);

    expect(res.headers['set-cookie']).toBeUndefined();
  });
});

describe('GET /api/auth/verify', () => {
  it('Verify without credential', async () => {
    const res = await request.get('/api/auth/verify').send().set('Accept', 'application/json').expect(401);

    expect(res.body.configs).toBeDefined();
  });

  it('Verify with valid credentials', async () => {
    const res = await request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(200);

    const verificationResponse: AuthVerificationResponse = res.body;

    expect(verificationResponse.initialUser).toBe(false);

    if (verificationResponse.initialUser === false) {
      expect(verificationResponse.level).toBe(testAdminUser.level);
      expect(verificationResponse.username).toBe(testAdminUser.username);
    }

    expect(verificationResponse.configs).toBeDefined();
  });

  it('Verify with wrong credentials generated by server secret', async () => {
    const res = await request
      .get('/api/auth/verify')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [`jwt=${getAuthToken('nonExistentUser')}`])
      .expect(401);

    expect(res.body.configs).toBeDefined();
  });
});

describe('GET /api/auth/logout', () => {
  it('Logouts with credentials', async () => {
    await request
      .get('/api/auth/logout')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(200)
      .expect('Set-Cookie', /jwt=;/);
  });

  it('Logouts without credential', async () => {
    await request.get('/api/auth/logout').send().set('Accept', 'application/json').expect(401);
  });
});

describe('POST /api/auth/authenticate', () => {
  it('Authenticate with no credential', async () => {
    await request
      .post('/api/auth/authenticate')
      .send({
        username: 'root',
      })
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /json/);
  });

  it('Authenticate with wrong credentials', async () => {
    await request
      .post('/api/auth/authenticate')
      .send({
        username: 'root',
        password: 'admin',
      })
      .set('Accept', 'application/json')
      .expect(401)
      .expect('Content-Type', /json/);
  });

  it('Authenticate with correct credentials', async () => {
    await request
      .post('/api/auth/authenticate')
      .send({
        username: testAdminUser.username,
        password: testAdminUser.password,
      })
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Set-Cookie', /jwt/);
  });
});

describe('GET /api/auth/users', () => {
  it('Lists user without credential', async () => {
    await request.get('/api/auth/users').send().set('Accept', 'application/json').expect(401);
  });

  it('Lists user with non-admin credentials', async () => {
    const res = await request
      .get('/api/auth/users')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [testNonAdminUserToken])
      .expect(403);

    expect(Array.isArray(res.body)).toBe(false);
  });

  it('Lists user with admin credentials', async () => {
    const res = await request
      .get('/api/auth/users')
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(typeof res.body[0].username).toBe('string');
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

  it('Updates a nonexistent user with admin credentials', async () => {
    await request
      .patch(`/api/auth/users/${`nonExistentUser`}`)
      .send(patch)
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(500);
  });

  it('Updates an existing user with non-admin credentials', async () => {
    await request
      .patch(`/api/auth/users/${testAdminUser.username}`)
      .send(patch)
      .set('Accept', 'application/json')
      .set('Cookie', [testNonAdminUserToken])
      .expect(403);
  });

  it('Updates an existing user with admin credentials', async () => {
    await request
      .patch(`/api/auth/users/${testNonAdminUser.username}`)
      .send(patch)
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(200);
  });

  it('Updates an existing user with admin credentials and malformed data', async () => {
    await request
      .patch(`/api/auth/users/${testNonAdminUser.username}`)
      .send({
        client: {
          ...patch.client,
          client: 'notClient',
        },
      })
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(function (res) {
        if (res.status != 400) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect(400);
  });
});

describe('DELETE /api/auth/users/{username}', () => {
  it('Deletes a nonexistent user with admin credentials', async () => {
    await request
      .delete(`/api/auth/users/${`nonExistentUser`}`)
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(500);
  });

  it('Deletes an existing user with non-admin credentials', async () => {
    await request
      .delete(`/api/auth/users/${testAdminUser.username}`)
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [testNonAdminUserToken])
      .expect(403);
  });

  it('Deletes an existing user with admin credentials', async () => {
    const res = await request
      .delete(`/api/auth/users/${testNonAdminUser.username}`)
      .send()
      .set('Accept', 'application/json')
      .set('Cookie', [testAdminUserToken])
      .expect(200);

    expect(res.body.username).toBe(testNonAdminUser.username);
  });
});
