import fs from 'node:fs';

import fastify from 'fastify';
import supertest from 'supertest';

import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '../../../shared/types/api/feed-monitor';
import type {Feed, Rule} from '../../../shared/types/Feed';
import {getTempPath} from '../../models/TemporaryStorage';
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

const feed: AddFeedOptions = {
  label: 'NYTimes',
  url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  interval: 1,
};

let addedFeed: Feed | null = null;

describe('GET /api/feed-monitor', () => {
  it('Expects nothing, yet. Verifies data structure.', (done) => {
    request
      .get('/api/feed-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const expectedResponse = {
          feeds: [],
          rules: [],
        };

        expect(res.body).toStrictEqual(expectedResponse);

        done();
      });
  });
});

describe('PUT /api/feed-monitor/feeds', () => {
  it('Subscribes to a feed', (done) => {
    request
      .put('/api/feed-monitor/feeds')
      .send(feed)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const response: Feed = res.body;

        expect(response).toMatchObject(feed);

        expect(response._id).not.toBeNull();
        expect(typeof response._id).toBe('string');

        addedFeed = response;

        done();
      });
  });

  it('GET /api/feed-monitor to verify added feed', (done) => {
    request
      .get('/api/feed-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const expectedResponse = {
          feeds: [addedFeed],
          rules: [],
        };

        expect(res.body).toStrictEqual(expectedResponse);

        done();
      });
  });

  it('GET /api/feed-monitor/feeds to verify added feed', (done) => {
    request
      .get('/api/feed-monitor/feeds')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toStrictEqual([addedFeed]);

        done();
      });
  });
});

describe('PATCH /api/feed-monitor/feeds/{id}', () => {
  const modifyFeedOptions: ModifyFeedOptions = {
    label: 'Modified Feed',
  };

  it('Modifies the added feed', (done) => {
    expect(addedFeed).not.toBe(null);
    if (addedFeed == null) return;

    request
      .patch(`/api/feed-monitor/feeds/${addedFeed._id}`)
      .send(modifyFeedOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);

        done();
      });
  });

  it('GET /api/feed-monitor/feeds/{id} to verify modified feed', (done) => {
    expect(addedFeed).not.toBe(null);
    if (addedFeed == null) return;

    request
      .get(`/api/feed-monitor/feeds/${addedFeed._id}`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        addedFeed = {...(addedFeed as Feed), ...modifyFeedOptions};

        expect(res.body).toStrictEqual([addedFeed]);

        done();
      });
  });
});

describe('GET /api/feed-monitor/feeds/{id}/items', () => {
  it('Requests items of the feed', (done) => {
    expect(addedFeed).not.toBe(null);
    if (addedFeed == null) return;

    request
      .get(`/api/feed-monitor/feeds/${addedFeed._id}/items`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(Array.isArray(res.body)).toBe(true);

        done();
      });
  });
});

const tempDirectory = getTempPath('download');

fs.mkdirSync(tempDirectory, {recursive: true});

let addedRule: Rule;

describe('GET /api/feed-monitor/rules', () => {
  it('Expects nothing, verifies the response is an array', (done) => {
    request
      .get(`/api/feed-monitor/rules`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(Array.isArray(res.body)).toBe(true);

        done();
      });
  });
});

describe('PUT /api/feed-monitor/rules', () => {
  const rule: AddRuleOptions = {
    label: 'Test rule',
    feedIDs: [''],
    match: '',
    exclude: '.*',
    destination: tempDirectory,
    tags: ['FeedItem'],
    startOnLoad: false,
  };

  it('Adds an automation rule', (done) => {
    expect(addedFeed).not.toBe(null);
    if (addedFeed == null) return;
    rule.feedIDs = [addedFeed._id];

    request
      .put('/api/feed-monitor/rules')
      .send(rule)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const response: Rule = res.body;

        expect(response).toMatchObject(rule);

        expect(response._id).not.toBeNull();
        expect(typeof response._id).toBe('string');

        addedRule = response;

        done();
      });
  });

  it('GET /api/feed-monitor to verify added rule', (done) => {
    request
      .get('/api/feed-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body.rules).toStrictEqual([addedRule]);

        done();
      });
  });

  it('GET /api/feed-monitor/rules to verify added rule', (done) => {
    request
      .get('/api/feed-monitor/rules')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toStrictEqual([addedRule]);

        done();
      });
  });
});

describe('DELETE /api/feed-monitor/{id}', () => {
  it('Deletes the added feed', (done) => {
    expect(addedFeed).not.toBe(null);
    if (addedFeed == null) return;

    request
      .delete(`/api/feed-monitor/${addedFeed._id}`)
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

  it('Deletes the added rule', (done) => {
    request
      .delete(`/api/feed-monitor/${addedRule._id}`)
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

  it('GET /api/feed-monitor to verify feed and rule are deleted', (done) => {
    request
      .get('/api/feed-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const expectedResponse = {
          feeds: [],
          rules: [],
        };

        expect(res.body).toStrictEqual(expectedResponse);

        done();
      });
  });
});
