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
        default:
            sortRules.push({[sortBy.direction]: property} as SortRule);
            break;
    }

    return sort(peers).by(sortRules);
}

export default sortPeers;
