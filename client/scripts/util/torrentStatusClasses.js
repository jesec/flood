import classnames from 'classnames';

import torrentStatusMap from '../../../shared/constants/torrentStatusMap';

export function torrentStatusClasses(torrent, ...classes) {
  let additionalClasses = [];

  classes.forEach((className) => {
    if (className) {
      additionalClasses.push(className);
    }
  });

  additionalClasses = additionalClasses.join(' ');

  return classnames(additionalClasses, {
    'has-error': torrent.status.includes(torrentStatusMap.error),
    'is-stopped': torrent.status.includes(torrentStatusMap.stopped),
    'is-paused': torrent.status.includes(torrentStatusMap.paused),
    'is-active': torrent.downloadRate > 0 || torrent.uploadRate > 0,
    'is-downloading': torrent.status.includes(torrentStatusMap.downloading),
    'is-seeding': torrent.status.includes(torrentStatusMap.seeding),
    'is-completed': torrent.status.includes(torrentStatusMap.complete),
    'is-checking': torrent.status.includes(torrentStatusMap.checking),
    'is-active': torrent.status.includes(torrentStatusMap.active),
    'is-inactive': torrent.status.includes(torrentStatusMap.inactive)
  });
}
