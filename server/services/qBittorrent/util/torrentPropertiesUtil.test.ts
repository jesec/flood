import {describe, expect, it} from 'vitest';

import {getTorrentStatusFromState} from './torrentPropertiesUtil';

describe('getTorrentStatusFromState', () => {
  describe('forced states', () => {
    it('reports a transferring force-seeding torrent as active', () => {
      expect(getTorrentStatusFromState('forcedUP', '', true)).toEqual(['complete', 'active', 'seeding']);
    });

    it('reports an idle force-seeding torrent as inactive', () => {
      expect(getTorrentStatusFromState('forcedUP', '', false)).toEqual(['complete', 'inactive', 'seeding']);
    });

    it('reports a transferring force-downloading torrent as active', () => {
      expect(getTorrentStatusFromState('forcedDL', '', true)).toEqual(['active', 'downloading']);
    });

    it('reports an idle force-downloading torrent as inactive', () => {
      expect(getTorrentStatusFromState('forcedDL', '', false)).toEqual(['inactive', 'downloading']);
    });

    it('keeps force-seeding torrents in the seeding taxonomy either way', () => {
      expect(getTorrentStatusFromState('forcedUP', '', true)).toContain('seeding');
      expect(getTorrentStatusFromState('forcedUP', '', false)).toContain('seeding');
    });
  });

  describe('states that already encode their own activity', () => {
    it('ignores the rate for uploading, which qBittorrent only reports when the rate is positive', () => {
      expect(getTorrentStatusFromState('uploading', '', false)).toEqual(['complete', 'active', 'seeding']);
    });

    it('ignores the rate for stalledUP, which qBittorrent only reports when the rate is zero', () => {
      expect(getTorrentStatusFromState('stalledUP', '', true)).toEqual(['complete', 'inactive', 'seeding']);
    });

    it('ignores the rate for downloading', () => {
      expect(getTorrentStatusFromState('downloading', '', false)).toEqual(['active', 'downloading']);
    });

    it('ignores the rate for stalledDL', () => {
      expect(getTorrentStatusFromState('stalledDL', '', true)).toEqual(['inactive', 'downloading']);
    });

    it('keeps queued torrents inactive regardless of rate', () => {
      expect(getTorrentStatusFromState('queuedUP', '', true)).toEqual(['complete', 'inactive', 'seeding']);
      expect(getTorrentStatusFromState('queuedDL', '', true)).toEqual(['inactive', 'downloading']);
    });

    it('keeps stopped torrents inactive regardless of rate', () => {
      expect(getTorrentStatusFromState('stoppedUP', '', true)).toEqual(['complete', 'inactive', 'stopped']);
      expect(getTorrentStatusFromState('stoppedDL', '', true)).toEqual(['inactive', 'stopped']);
    });
  });

  describe('tracker messages', () => {
    it('appends warning without disturbing the activity flag', () => {
      expect(getTorrentStatusFromState('forcedUP', 'tracker is down', true)).toEqual([
        'complete',
        'active',
        'seeding',
        'warning',
      ]);
    });
  });

  describe('defaults', () => {
    it('treats an omitted rate as not transferring', () => {
      expect(getTorrentStatusFromState('forcedUP')).toEqual(['complete', 'inactive', 'seeding']);
    });
  });
});
