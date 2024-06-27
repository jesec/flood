import {WatchedDirectory} from '@shared/types/Watch';
import WatchService from './watchService';
import type {UserInDatabase} from '@shared/schema/Auth';
import Users from '../models/Users';
import {getTempPath} from '../models/TemporaryStorage';
import fs from 'fs';

const tempDirectory = getTempPath('download');
fs.mkdirSync(tempDirectory, {recursive: true});
describe('Watch Service', () => {
  it('Listens for a new torrent.', (done) => {
    const user:UserInDatabase = {
      ...Users.getConfigUser(),
    };

    const watchService = new WatchService(user);

    const newWatch : WatchedDirectory = {
      type: 'watchedDirectory',
      _id: '1',
      label: 'test',
      dir: tempDirectory,
      count: 0,
      destination: 'dest',
      tags: ['tag']
    }
    watchService.addWatch(newWatch)
      .then(() => {
        fs.copyFile('fixtures/single.torrent', tempDirectory+'/single.torrent', ()=>{ console.log("lol") })
          done()
        }
      );
  });
});