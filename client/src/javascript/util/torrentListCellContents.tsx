import {FormattedDate, FormattedMessage, FormattedNumber} from 'react-intl';
import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import Checkmark from '../components/icons/Checkmark';
import Duration from '../components/general/Duration';
import Size from '../components/general/Size';

import type {TorrentListColumn} from '../constants/TorrentListColumns';

const booleanTransformer = (value: boolean) =>
  value ? <Checkmark className="torrent__detail__icon torrent__detail__icon--checkmark" /> : null;
const dateTransformer = (date: number) => <FormattedDate value={date * 1000} />;
const peersTransformer = (peersConnected: number, totalPeers: number) => (
  <FormattedMessage
    id="torrent.list.peers"
    values={{
      connected: <FormattedNumber value={peersConnected} />,
      of: (
        <em className="unit">
          <FormattedMessage id="torrent.list.peers.of" />
        </em>
      ),
      total: <FormattedNumber value={totalPeers} />,
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
  ratio: (ratio: TorrentProperties['ratio']) => <FormattedNumber value={ratio} maximumFractionDigits={2} />,
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
