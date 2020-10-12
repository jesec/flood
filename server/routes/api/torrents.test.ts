import fs from 'fs';
import readline from 'readline';
import stream from 'stream';
import supertest from 'supertest';

import type {AddTorrentByURLOptions} from '../../../shared/types/api/torrents';
import type {TorrentList, TorrentProperties} from '../../../shared/types/Torrent';
import type {TorrentStatus} from '../../../shared/constants/torrentStatusMap';

import app from '../../app';
import {getAuthToken} from './auth';

import {getTempPath} from '../../models/TemporaryStorage';

const request = supertest(app);

const authToken = `jwt=${getAuthToken('_config')}`;

const tempDirectory = getTempPath('rtorrent');

fs.mkdirSync(tempDirectory, {recursive: true});

jest.setTimeout(20000);

describe('POST /api/torrents/add-urls', () => {
  const addTorrentByURLOptions: AddTorrentByURLOptions = {
    urls: ['https://releases.ubuntu.com/20.04/ubuntu-20.04.1-live-server-amd64.iso.torrent'],
    destination: tempDirectory,
    tags: ['test'],
    isBasePath: false,
    start: false,
  };

  const activityStream = new stream.PassThrough();
  const rl = readline.createInterface({input: activityStream});

  const req = request.get('/api/activity-stream').send().set('Cookie', [authToken]);

  const torrentAdded = new Promise((resolve) => {
    req.pipe(activityStream);
    rl.on('line', (input) => {
      if (input.includes('TORRENT_LIST_DIFF_CHANGE')) {
        resolve();
      }
    });
  });

  it('Adds a torrent from URL', (done) => {
    request
      .post('/api/torrents/add-urls')
      .send(addTorrentByURLOptions)
      .set('Cookie', [authToken])
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, _res) => {
        if (err) done(err);

        done();
      });
  });

  it('GET /api/torrents', (done) => {
    torrentAdded.then(() => {
      request
        .get('/api/torrents')
        .send()
        .set('Cookie', [authToken])
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) done(err);

          expect(res.body.torrents == null).toBe(false);
          const torrentList: TorrentList = res.body.torrents;

          const [torrent]: Array<TorrentProperties> = Object.values(torrentList);

          expect(torrent.baseDirectory).toBe(addTorrentByURLOptions.destination);
          expect(torrent.tags).toStrictEqual(addTorrentByURLOptions.tags);

          const expectedStatuses: Array<TorrentStatus> = addTorrentByURLOptions.start
            ? ['downloading']
            : ['stopped', 'inactive'];
          expect(torrent.status).toEqual(expect.arrayContaining(expectedStatuses));

          done();
        });
    });
  });
});
