import {sort} from 'fast-sort';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentPeer} from '@shared/types/TorrentPeer';

type SortRule = {
    [direction in FloodSettings['sortPeers']['direction']]:
    | keyof TorrentPeer
    | ((p: TorrentPeer) => unknown);
};

function sortPeers(
    peers: TorrentPeer[],
    sortBy: Readonly<FloodSettings['sortPeers']>,
): TorrentPeer[] {
    const {property} = sortBy;
    const sortRules: Array<SortRule> = [];

    switch (property) {

        // we sort numerically by the first IP block
        case 'address':
            const sortedData = peers.sort((p1: TorrentPeer, p2: TorrentPeer) => {
                return p1.address.split('.')[0] - p2.address.split('.')[0];
            })
            return sortBy.direction === 'asc' ? sortedData : sortedData.reverse();

        // we sort clients as case-insensitive
        case 'clientVersion':
            sortRules.push({
                [sortBy.direction]: (p: TorrentPeer) => p.clientVersion.toLowerCase(),
            } as SortRule);
            break;

        // default alphabetically
        default:
            sortRules.push({[sortBy.direction]: property} as SortRule);
            break;
    }

    return sort(peers).by(sortRules);
}

export default sortPeers;
