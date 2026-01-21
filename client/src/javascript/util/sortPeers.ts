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

        // we sort numerically for IPv4 and alphabetically for IPv6 using the first IP block
        case 'address':

            // prepare arrays
            const ipv4 = peers.filter((value) => value.address.includes('.'));
            const ipv6 = peers.filter((value) => value.address.includes(':'));

            // sort v4
            const sortedIpv4 = ipv4.sort((p1: TorrentPeer, p2: TorrentPeer) => {
                return p1.address.split('.')[0] - p2.address.split('.')[0];
            })

            // sort v6
            const sortedIpv6 = ipv6.sort((p1: TorrentPeer, p2: TorrentPeer) => {
                return (p1.address.split(':')[0] < p2.address.split(':')[0]) ? -1 : 1;
            })

            // then return sorted data
            const sortedData = sortedIpv4.concat(sortedIpv6);
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
