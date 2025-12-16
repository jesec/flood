import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import fs from 'node:fs';

import fastify from 'fastify';
import supertest from 'supertest';

import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '../../../shared/types/api/feed-monitor';
import type {Feed, Rule} from '../../../shared/types/Feed';
import {getTempPath} from '../../models/TemporaryStorage';
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

const feed: AddFeedOptions = {
  label: 'NYTimes',
  url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  interval: 1,
};

let addedFeed: Feed | null = null;

describe('GET /api/feed-monitor', () => {
  it('Expects nothing, yet. Verifies data structure.', async () => {
    const res = await request
      .get('/api/feed-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    const expectedResponse = {
      feeds: [],
      rules: [],
    };

    expect(res.body).toStrictEqual(expectedResponse);
  });
});

describe('PUT /api/feed-monitor/feeds', () => {
  it('Subscribes to a feed', async () => {
    const res = await request
      .put('/api/feed-monitor/feeds')
      .send(feed)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    const response: Feed = res.body;

    expect(response).toMatchObject(feed);

    expect(response._id).not.toBeNull();
    expect(typeof response._id).toBe('string');

    addedFeed = response;
  });

  it('GET /api/feed-monitor to verify added feed', async () => {
    const res = await request
      .get('/api/feed-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    const expectedResponse = {
      feeds: [addedFeed],
      rules: [],
    };

    expect(res.body).toStrictEqual(expectedResponse);
  });

  it('GET /api/feed-monitor/feeds to verify added feed', async () => {
    const res = await request
      .get('/api/feed-monitor/feeds')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toStrictEqual([addedFeed]);
  });
});

describe('PATCH /api/feed-monitor/feeds/{id}', () => {
  const modifyFeedOptions: ModifyFeedOptions = {
    label: 'Modified Feed',
  };

  it('Modifies the added feed', async () => {
    expect(addedFeed).not.toBeNull();
    const feedId = addedFeed?._id as string;

    await request
      .patch(`/api/feed-monitor/feeds/${feedId}`)
      .send(modifyFeedOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  it('GET /api/feed-monitor/feeds/{id} to verify modified feed', async () => {
    expect(addedFeed).not.toBeNull();
    const feedId = addedFeed?._id as string;

    const res = await request
      .get(`/api/feed-monitor/feeds/${feedId}`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    addedFeed = {...(addedFeed as Feed), ...modifyFeedOptions};

    expect(res.body).toStrictEqual([addedFeed]);
  });
});

describe('GET /api/feed-monitor/feeds/{id}/items', () => {
  it('Requests items of the feed', async () => {
    expect(addedFeed).not.toBeNull();
    const feedId = addedFeed?._id as string;

    const res = await request
      .get(`/api/feed-monitor/feeds/${feedId}/items`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
  });
});

const tempDirectory = getTempPath('download');

fs.mkdirSync(tempDirectory, {recursive: true});

let addedRule: Rule;

describe('GET /api/feed-monitor/rules', () => {
  it('Expects nothing, verifies the response is an array', async () => {
    const res = await request
      .get(`/api/feed-monitor/rules`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
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

  it('Adds an automation rule', async () => {
    expect(addedFeed).not.toBeNull();
    rule.feedIDs = [addedFeed?._id as string];

    const res = await request
      .put('/api/feed-monitor/rules')
      .send(rule)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    const response: Rule = res.body;

    expect(response).toMatchObject(rule);

    expect(response._id).not.toBeNull();
    expect(typeof response._id).toBe('string');

    addedRule = response;
  });

  it('GET /api/feed-monitor to verify added rule', async () => {
    const res = await request
      .get('/api/feed-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.rules).toStrictEqual([addedRule]);
  });

  it('GET /api/feed-monitor/rules to verify added rule', async () => {
    const res = await request
      .get('/api/feed-monitor/rules')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toStrictEqual([addedRule]);
  });
});

describe('DELETE /api/feed-monitor/{id}', () => {
  it('Deletes the added feed', async () => {
    expect(addedFeed).not.toBeNull();
    const feedId = addedFeed?._id as string;

    await request
      .delete(`/api/feed-monitor/${feedId}`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  it('Deletes the added rule', async () => {
    await request
      .delete(`/api/feed-monitor/${addedRule._id}`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  it('GET /api/feed-monitor to verify feed and rule are deleted', async () => {
    const res = await request
      .get('/api/feed-monitor')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    const expectedResponse = {
      feeds: [],
      rules: [],
    };

    expect(res.body).toStrictEqual(expectedResponse);
  });
});
