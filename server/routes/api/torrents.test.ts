import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';
import stream from 'stream';
import supertest from 'supertest';

import app from '../../app';
import {getAuthToken} from './auth';
import {getTempPath} from '../../models/TemporaryStorage';
import paths from '../../../shared/config/paths';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  CreateTorrentOptions,
  SetTorrentsTrackersOptions,
} from '../../../shared/types/api/torrents';
import type {TorrentContent} from '../../../shared/types/TorrentContent';
import type {TorrentList} from '../../../shared/types/Torrent';
import type {TorrentStatus} from '../../../shared/constants/torrentStatusMap';
import type {TorrentTracker} from '../../../shared/types/TorrentTracker';

const request = supertest(app);

const authToken = `jwt=${getAuthToken('_config')}`;

const tempDirectory = getTempPath('download');

fs.mkdirSync(tempDirectory, {recursive: true});

jest.setTimeout(20000);

const torrentFiles = [
  path.join(paths.appSrc, 'fixtures/single.torrent'),
  path.join(paths.appSrc, 'fixtures/multi.torrent'),
].map((torrentPath) => Buffer.from(fs.readFileSync(torrentPath)).toString('base64'));

const torrentURLs = [
  'https://releases.ubuntu.com/20.04/ubuntu-20.04.1-live-server-amd64.iso.torrent',
  'https://flood.js.org/api/test-cookie',
];

const torrentCookies = {
  'flood.js.org': ['test=test'],
};

const testTrackers = [
  `https://${crypto.randomBytes(8).toString('hex')}.com/announce`,
  `http://${crypto.randomBytes(8).toString('hex')}.com/announce?key=test`,
  `http://${crypto.randomBytes(8).toString('hex')}.com/announce.php?key=test`,
];

let torrentHash = '';

const activityStream = new stream.PassThrough();
const rl = readline.createInterface({input: activityStream});
request.get('/api/activity-stream').send().set('Cookie', [authToken]).pipe(activityStream);

const watchTorrentList = (op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'): Promise<void> => {
  return new Promise((resolve) => {
    let eventDetected = false;
    rl.on('line', (input) => {
      if (eventDetected && input.includes(`"op":"${op}"`)) {
        resolve();
      }
      if (input.includes('TORRENT_LIST_DIFF_CHANGE')) {
        eventDetected = true;
      }
    });
  });
};

describe('POST /api/torrents/add-urls', () => {
  const addTorrentByURLOptions: AddTorrentByURLOptions = {
    urls: torrentURLs,
    cookies: torrentCookies,
    destination: tempDirectory,
    tags: ['testURLs'],
    isBasePath: false,
    start: false,
  };

  it('Adds torrents to disallowed path via URLs', (done) => {
    request
      .post('/api/torrents/add-urls')
      .send({...addTorrentByURLOptions, destination: path.join(os.tmpdir(), 'notAllowed')})
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(500)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toEqual({code: 'EACCES'});

        done();
      });
  });

  it('Adds torrents via URLs', (done) => {
    const torrentAdded = watchTorrentList('add');
    request
      .post('/api/torrents/add-urls')
      .send(addTorrentByURLOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);

        torrentAdded.then(() => {
          done();
        });
      });
  });

  it('GET /api/torrents to verify torrents are added via URLs', (done) => {
    request
      .get('/api/torrents')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(async (err, res) => {
        if (err) done(err);

        expect(res.body.torrents).not.toBeNull();
        const torrentList: TorrentList = res.body.torrents;

        const addedTorrents = Object.values(torrentList).filter((torrent) =>
          addTorrentByURLOptions.tags?.every((tag) => torrent.tags.includes(tag)),
        );

        expect(addedTorrents).toHaveLength(addTorrentByURLOptions.urls.length);

        await Promise.all(
          addedTorrents.map(async (torrent) => {
            expect(torrent.baseDirectory).toBe(addTorrentByURLOptions.destination);

            const expectedStatuses: Array<TorrentStatus> = addTorrentByURLOptions.start
              ? ['downloading']
              : ['stopped', 'inactive'];
            expect(torrent.status).toEqual(expect.arrayContaining(expectedStatuses));

            torrentHash = torrent.hash;
          }),
        );

        done();
      });
  });
});

describe('POST /api/torrents/add-files', () => {
  const addTorrentByFileOptions: AddTorrentByFileOptions = {
    files: torrentFiles,
    destination: tempDirectory,
    tags: ['testAddFiles'],
    isBasePath: false,
    start: false,
  };

  it('Adds torrents to disallowed path via files', (done) => {
    request
      .post('/api/torrents/add-urls')
      .send({...addTorrentByFileOptions, destination: path.join(os.tmpdir(), 'notAllowed')})
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(500)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        expect(res.body).toEqual({code: 'EACCES'});

        done();
      });
  });

  it('Adds torrents via files', (done) => {
    const torrentAdded = watchTorrentList('add');
    request
      .post('/api/torrents/add-files')
      .send(addTorrentByFileOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);

        torrentAdded.then(() => {
          done();
        });
      });
  });

  it('GET /api/torrents to verify torrents are added via files', (done) => {
    request
      .get('/api/torrents')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(async (err, res) => {
        if (err) done(err);

        expect(res.body.torrents == null).toBe(false);
        const torrentList: TorrentList = res.body.torrents;

        const addedTorrents = Object.values(torrentList).filter((torrent) =>
          addTorrentByFileOptions.tags?.every((tag) => torrent.tags.includes(tag)),
        );

        expect(addedTorrents).toHaveLength(addTorrentByFileOptions.files.length);

        await Promise.all(
          addedTorrents.map(async (torrent) => {
            expect(torrent.directory.startsWith(addTorrentByFileOptions.destination)).toBe(true);
          }),
        );

        done();
      });
  });
});

describe('POST /api/torrents/create', () => {
  const createTorrentOptions: CreateTorrentOptions = {
    sourcePath: tempDirectory,
    tags: ['testCreate'],
    trackers: testTrackers,
    start: true,
    isPrivate: false,
  };

  const dummyFilePath = path.join(tempDirectory, 'dummy');
  fs.writeFileSync(dummyFilePath, 'test');

  it('Creates a multi-file torrent', (done) => {
    const torrentAdded = watchTorrentList('add');
    request
      .post('/api/torrents/create')
      .send(createTorrentOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/x-bittorrent')
      .expect(200)
      .expect('Content-Type', /x-bittorrent/)
      .end((err, _res) => {
        if (err) done(err);

        torrentAdded.then(() => {
          done();
        });
      });
  });

  it('Creates a single-file torrent', (done) => {
    const torrentAdded = watchTorrentList('add');
    request
      .post('/api/torrents/create')
      .send({...createTorrentOptions, sourcePath: dummyFilePath})
      .set('Cookie', [authToken])
      .set('Accept', 'application/x-bittorrent')
      .expect(200)
      .expect('Content-Type', /x-bittorrent/)
      .end((err, _res) => {
        if (err) done(err);

        torrentAdded.then(() => {
          done();
        });
      });
  });

  it('GET /api/torrents to verify torrents are added via creation', (done) => {
    request
      .get('/api/torrents')
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(async (err, res) => {
        if (err) done(err);

        expect(res.body.torrents == null).toBe(false);
        const torrentList: TorrentList = res.body.torrents;

        const addedTorrents = Object.values(torrentList).filter((torrent) =>
          createTorrentOptions.tags?.every((tag) => torrent.tags.includes(tag)),
        );

        expect(addedTorrents).toHaveLength(2);

        await Promise.all(
          addedTorrents.map(async (torrent) => {
            expect(torrent.isPrivate).toBe(createTorrentOptions.isPrivate);
            expect(torrent.percentComplete).toBe(100);
          }),
        );

        done();
      });
  });
});

describe('PATCH /api/torrents/trackers', () => {
  it('Sets single tracker', (done) => {
    const setTrackersOptions: SetTorrentsTrackersOptions = {
      hashes: [torrentHash],
      trackers: [testTrackers[0]],
    };

    request
      .patch('/api/torrents/trackers')
      .send(setTrackersOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);

        done();
      });
  });

  it('Sets multiple trackers', (done) => {
    const setTrackersOptions: SetTorrentsTrackersOptions = {
      hashes: [torrentHash],
      trackers: testTrackers,
    };

    request
      .patch('/api/torrents/trackers')
      .send(setTrackersOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);

        done();
      });
  });

  it('GET /api/torrents/{hash}/trackers', (done) => {
    request
      .get(`/api/torrents/${torrentHash}/trackers`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const trackers: Array<TorrentTracker> = res.body;
        expect(trackers.filter((tracker) => testTrackers.includes(tracker.url)).length).toBeGreaterThanOrEqual(
          testTrackers.length,
        );

        done();
      });
  });
});

describe('GET /api/torrents/{hash}/contents', () => {
  it('Gets contents of torrents', (done) => {
    request
      .get(`/api/torrents/${torrentHash}/contents`)
      .send()
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);

        const contents: Array<TorrentContent> = res.body;

        expect(Array.isArray(contents)).toBe(true);

        done();
      });
  });
});
