import classnames from 'classnames';

import torrentStatusMap from '../../../shared/constants/torrentStatusMap';

export function torrentStatusClasses(torrent, ...classes) {
  return classnames(classes, {
    'torrent--has-error': torrent.status.includes(torrentStatusMap.error),
    'torrent--is-stopped': torrent.status.includes(torrentStatusMap.stopped),
    'torrent--is-paused': torrent.status.includes(torrentStatusMap.paused),
    'torrent--is-active': torrent.downloadRate > 0 || torrent.uploadRate > 0,
    'torrent--is-downloading': torrent.status.includes(torrentStatusMap.downloading),
    'torrent--is-seeding': torrent.status.includes(torrentStatusMap.seeding),
    'torrent--is-completed': torrent.status.includes(torrentStatusMap.complete),
    'torrent--is-checking': torrent.status.includes(torrentStatusMap.checking),
    'torrent--is-active': torrent.status.includes(torrentStatusMap.active),
    'torrent--is-inactive': torrent.status.includes(torrentStatusMap.inactive)
  });
}
