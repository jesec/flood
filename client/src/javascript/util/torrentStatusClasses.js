import classnames from 'classnames';
import torrentStatusMap from 'universally-shared-code/constants/torrentStatusMap';

export function torrentStatusClasses(torrent, ...classes) {
  return classnames(classes, {
    'torrent--has-error': torrent.status.includes(torrentStatusMap.error),
    'torrent--is-stopped': torrent.status.includes(torrentStatusMap.stopped),
    'torrent--is-downloading': torrent.status.includes(torrentStatusMap.downloading),
    'torrent--is-downloading--actively': torrent.status.includes(torrentStatusMap.activelyDownloading),
    'torrent--is-uploading--actively': torrent.status.includes(torrentStatusMap.activelyUploading),
    'torrent--is-seeding': torrent.status.includes(torrentStatusMap.seeding),
    'torrent--is-completed': torrent.status.includes(torrentStatusMap.complete),
    'torrent--is-checking': torrent.status.includes(torrentStatusMap.checking),
    'torrent--is-inactive': torrent.status.includes(torrentStatusMap.inactive),
  });
}
