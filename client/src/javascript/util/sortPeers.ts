import {sort} from 'fast-sort';

import type {TorrentPeer} from '@shared/types/TorrentPeer';

export type PeerSortDirection = 'asc' | 'desc';

export type PeerSortProperty = 'downloadRate' | 'uploadRate' | 'completedPercent';

export interface PeerSortBy {
  property: PeerSortProperty;
  direction: PeerSortDirection;
}

function sortPeers(peers: TorrentPeer[], sortBy: Readonly<PeerSortBy>): TorrentPeer[] {
  return sortBy.direction === 'asc' ? sort(peers).asc(sortBy.property) : sort(peers).desc(sortBy.property);
}

export default sortPeers;
