import {i18n} from '@lingui/core';
import {Trans} from '@lingui/react';

import {CheckmarkThick} from '@client/ui/icons';
import Duration from '@client/components/general/Duration';
import Size from '@client/components/general/Size';

import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

import type {TorrentProperties} from '@shared/types/Torrent';

const booleanTransformer = (value: boolean) =>
  value ? <CheckmarkThick className="torrent__detail__icon torrent__detail__icon--checkmark" /> : null;
const dateTransformer = (date: number) => i18n.date(new Date(date * 1000));
const peersTransformer = (peersConnected: number, totalPeers: number) => (
  <Trans
    id="torrent.list.peers"
    values={{
      connected: i18n.number(peersConnected),
      of: (
        <em className="unit">
          <Trans id="torrent.list.peers.of" />
        </em>
      ),
      total: i18n.number(totalPeers),
    }}
  />
);
const speedTransformer = (value: number) => <Size value={value} isSpeed />;
const sizeTransformer = (value: number) => <Size value={value} />;

export const torrentListCellTransformers = {
  dateAdded: dateTransformer,
  dateCreated: dateTransformer,
  downRate: speedTransformer,
  downTotal: sizeTransformer,
  isPrivate: booleanTransformer,
  peers: peersTransformer,
  seeds: peersTransformer,
  tags: (tags: TorrentProperties['tags']) => (
    <ul className="torrent__tags tag">
      {tags.map((tag) => (
        <li className="torrent__tag" key={tag}>
          {tag}
        </li>
      ))}
    </ul>
  ),
  ratio: (ratio: TorrentProperties['ratio']) => i18n.number(ratio, {maximumFractionDigits: 2}),
  sizeBytes: sizeTransformer,
  trackerURIs: (trackers: TorrentProperties['trackerURIs']) => trackers.join(', '),
  upRate: speedTransformer,
  upTotal: sizeTransformer,
  eta: (eta: TorrentProperties['eta']) => {
    if (!eta) {
      return null;
    }

    return <Duration value={eta} />;
  },
};

export const getTorrentListCellContent = (torrent: TorrentProperties, column: TorrentListColumn) => {
  switch (column) {
    case 'dateAdded':
    case 'dateCreated':
    case 'downRate':
    case 'upRate':
    case 'downTotal':
    case 'upTotal':
    case 'sizeBytes':
    case 'ratio':
      return torrentListCellTransformers[column](torrent[column]);
    case 'isPrivate':
      return torrentListCellTransformers[column](torrent[column]);
    case 'tags':
    case 'trackerURIs':
      return torrentListCellTransformers[column](torrent[column]);
    case 'eta':
      return torrentListCellTransformers[column](torrent[column]);
    case 'seeds':
      return torrentListCellTransformers[column](torrent.seedsConnected, torrent.seedsTotal);
    case 'peers':
      return torrentListCellTransformers[column](torrent.peersConnected, torrent.peersTotal);
    default:
      return torrent[column];
  }
};
