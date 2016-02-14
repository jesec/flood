import classnames from 'classnames';

import propsMap from '../../../../shared/constants/propsMap';

export function torrentStatusClasses(torrent, ...classes) {
  let additionalClasses = [];

  classes.forEach(function (className) {
    if (className) {
      additionalClasses.push(className);
    }
  });

  additionalClasses = additionalClasses.join(' ');

  return classnames({
    [additionalClasses]: additionalClasses,
    'has-error': torrent.status.indexOf(propsMap.clientStatus.error) > -1,
    'is-stopped': torrent.status.indexOf(propsMap.clientStatus.stopped) > -1,
    'is-paused': torrent.status.indexOf(propsMap.clientStatus.paused) > -1,
    'is-actively-downloading': torrent.downloadRate > 0,
    'is-downloading': torrent.status.indexOf(propsMap.clientStatus.downloading) > -1,
    'is-seeding': torrent.status.indexOf(propsMap.clientStatus.seeding) > -1,
    'is-completed': torrent.status.indexOf(propsMap.clientStatus.complete) > -1,
    'is-checking': torrent.status.indexOf(propsMap.clientStatus.checking) > -1,
    'is-active': torrent.status.indexOf(propsMap.clientStatus.active) > -1,
    'is-inactive': torrent.status.indexOf(propsMap.clientStatus.inactive) > -1
  });
}
