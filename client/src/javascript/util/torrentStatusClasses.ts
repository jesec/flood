import classnames from 'classnames';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

function torrentStatusClasses(torrent: {status: Array<TorrentStatus>}, ...classes: Array<string>) {
  return classnames(classes, {
    'torrent--has-error': torrent.status.includes('error'),
    'torrent--is-stopped': torrent.status.includes('stopped'),
    'torrent--is-downloading': torrent.status.includes('downloading'),
    'torrent--is-downloading--actively': torrent.status.includes('activelyDownloading'),
    'torrent--is-uploading--actively': torrent.status.includes('activelyUploading'),
    'torrent--is-seeding': torrent.status.includes('seeding'),
    'torrent--is-completed': torrent.status.includes('complete'),
    'torrent--is-checking': torrent.status.includes('checking'),
    'torrent--is-inactive': torrent.status.includes('inactive'),
  });
}

export default torrentStatusClasses;
