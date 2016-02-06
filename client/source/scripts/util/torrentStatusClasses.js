import classnames from 'classnames';

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
    'has-error': torrent.status.indexOf('e') > -1,
    'is-stopped': torrent.status.indexOf('s') > -1,
    'is-paused': torrent.status.indexOf('p') > -1,
    'is-actively-downloading': torrent.downloadRate > 0,
    'is-downloading': torrent.status.indexOf('d') > -1,
    'is-seeding': torrent.status.indexOf('sd') > -1,
    'is-completed': torrent.status.indexOf('c') > -1,
    'is-checking': torrent.status.indexOf('ch') > -1,
    'is-active': torrent.status.indexOf('a') > -1,
    'is-inactive': torrent.status.indexOf('i') > -1
  });
}
