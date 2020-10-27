import classnames from 'classnames';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

function torrentStatusClasses(status: Array<TorrentStatus>, ...classes: Array<string>) {
  return classnames(classes, {
    'torrent--has-error': status.includes('error'),
    'torrent--is-stopped': status.includes('stopped'),
    'torrent--is-downloading': status.includes('downloading'),
    'torrent--is-downloading--actively': status.includes('activelyDownloading'),
    'torrent--is-uploading--actively': status.includes('activelyUploading'),
    'torrent--is-seeding': status.includes('seeding'),
    'torrent--is-completed': status.includes('complete'),
    'torrent--is-checking': status.includes('checking'),
    'torrent--is-inactive': status.includes('inactive'),
  });
}

export default torrentStatusClasses;
