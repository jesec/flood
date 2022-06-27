import classnames from 'classnames';
import {computed} from 'mobx';
import {FC} from 'react';
import {observer} from 'mobx-react';
import {Trans, useLingui} from '@lingui/react';

import {
  CalendarFinished,
  CalendarCreated,
  Calendar,
  CheckmarkThick,
  Clock,
  DiskFlat,
  DetailNotAvailable,
  DownloadThick,
  FolderClosedSolid,
  Hash,
  Lock,
  TrackerMessage,
  Peers,
  Ratio,
  Seeds,
  Radar,
  UploadThick,
} from '@client/ui/icons';
import Duration from '@client/components/general/Duration';
import ProgressBar from '@client/components/general/ProgressBar';
import Size from '@client/components/general/Size';
import {torrentStatusEffective} from '@client/util/torrentStatus';
import TorrentStore from '@client/stores/TorrentStore';

import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

import type {TorrentProperties} from '@shared/types/Torrent';

const ICONS: Partial<Record<TorrentListColumn, JSX.Element>> = {
  eta: <Clock />,
  sizeBytes: <DiskFlat />,
  downRate: <DownloadThick />,
  directory: <FolderClosedSolid />,
  hash: <Hash />,
  dateAdded: <Calendar />,
  dateCreated: <CalendarCreated />,
  dateFinished: <CalendarFinished />,
  isPrivate: <Lock />,
  message: <TrackerMessage />,
  percentComplete: <DownloadThick />,
  peers: <Peers />,
  ratio: <Ratio />,
  seeds: <Seeds />,
  trackerURIs: <Radar />,
  upRate: <UploadThick />,
  upTotal: <UploadThick />,
} as const;

const BooleanCell: FC<{value: boolean}> = observer(({value}: {value: boolean}) =>
  value ? <CheckmarkThick className="torrent__detail__icon torrent__detail__icon--checkmark" /> : null,
);

const DateCell: FC<{date: number}> = observer(({date}: {date: number}) => {
  const {i18n} = useLingui();

  return <span>{i18n.date(new Date(date * 1000))}</span>;
});

const ETACell: FC<{eta: number}> = observer(({eta}: {eta: number}) => (eta ? <Duration value={eta} /> : null));

const PeerCell: FC<{peersConnected: number; totalPeers: number}> = observer(
  ({peersConnected, totalPeers}: {peersConnected: number; totalPeers: number}) => {
    const {i18n} = useLingui();

    return (
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
  },
);

const RatioCell: FC<{ratio: number}> = observer(({ratio}: {ratio: number}) => {
  const {i18n} = useLingui();

  return <span>{i18n.number(ratio, {maximumFractionDigits: 2})}</span>;
});

const TagsCell: FC<{tags: string[]}> = observer(({tags}: {tags: string[]}) => (
  <ul className="torrent__tags tag">
    {tags.map((tag) => (
      <li className="torrent__tag" key={tag}>
        {tag}
      </li>
    ))}
  </ul>
));

const TrackersCell: FC<{trackers: string[]}> = observer(({trackers}: {trackers: string[]}) => (
  <span>{trackers.join(', ')}</span>
));

export interface TorrentListCellContentProps {
  torrent: TorrentProperties;
  column: TorrentListColumn;
}

const DefaultTorrentListCellContent: FC<TorrentListCellContentProps> = observer(
  ({torrent, column}: TorrentListCellContentProps) => {
    switch (column) {
      case 'dateAdded':
        return <DateCell date={torrent[column]} />;
      case 'dateCreated':
        return <DateCell date={torrent[column]} />;
      case 'dateFinished':
        return <DateCell date={torrent[column]} />;
      case 'downRate':
        return <Size value={torrent[column]} isSpeed />;
      case 'upRate':
        return <Size value={torrent[column]} isSpeed />;
      case 'downTotal':
        return <Size value={torrent[column]} />;
      case 'upTotal':
        return <Size value={torrent[column]} />;
      case 'sizeBytes':
        return <Size value={torrent[column]} />;
      case 'ratio':
        return <RatioCell ratio={torrent[column]} />;
      case 'isPrivate':
        return <BooleanCell value={torrent[column]} />;
      case 'tags':
        return <TagsCell tags={torrent[column]} />;
      case 'trackerURIs':
        return <TrackersCell trackers={torrent[column]} />;
      case 'eta':
        return <ETACell eta={torrent[column]} />;
      case 'seeds':
        return <PeerCell peersConnected={torrent.seedsConnected} totalPeers={torrent.seedsTotal} />;
      case 'peers':
        return <PeerCell peersConnected={torrent.peersConnected} totalPeers={torrent.peersTotal} />;
      case 'percentComplete':
        return (
          <ProgressBar
            percent={computed(() => Math.ceil(torrent.percentComplete)).get()}
            status={computed(() => torrentStatusEffective(torrent.status)).get()}
          />
        );
      default:
        return <span>{torrent[column]}</span>;
    }
  },
);

interface TorrentListCellProps {
  hash: string;
  column: TorrentListColumn;
  content?: FC<TorrentListCellContentProps>;
  className?: string;
  classNameOverride?: boolean;
  width?: number;
  showIcon?: boolean;
}

const TorrentListCell: FC<TorrentListCellProps> = observer(
  ({
    hash,
    content: TorrentListCellContent,
    column,
    className,
    classNameOverride,
    width,
    showIcon,
  }: TorrentListCellProps) => {
    const icon = showIcon ? ICONS[column] : null;

    return (
      <div
        className={
          classNameOverride ? className : classnames('torrent__detail', `torrent__detail--${column}`, className)
        }
        css={{pointerEvents: 'none', userSelect: 'none'}}
        role="cell"
        style={{width: `${width}px`}}
      >
        {icon}
        {TorrentListCellContent ? (
          <TorrentListCellContent torrent={TorrentStore.torrents[hash]} column={column} />
        ) : (
          <DetailNotAvailable />
        )}
      </div>
    );
  },
);

TorrentListCell.defaultProps = {
  className: undefined,
  classNameOverride: false,
  content: DefaultTorrentListCellContent,
  width: undefined,
  showIcon: false,
};

export default TorrentListCell;
