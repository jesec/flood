import classnames from 'classnames';
import {FC, useEffect, useState} from 'react';
import {observer} from 'mobx-react';
import {Trans, useLingui} from '@lingui/react';

import {Clock, DownloadThick, Ratio, Start, Stop, UploadThick} from '@client/ui/icons';
import TorrentActions from '@client/actions/TorrentActions';
import torrentStatusClasses from '@client/util/torrentStatusClasses';
import torrentStatusIcons from '@client/util/torrentStatusIcons';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import Duration from '../../general/Duration';
import PriorityMeter from '../../general/PriorityMeter';
import ProgressBar from '../../general/ProgressBar';
import Size from '../../general/Size';

const TorrentHeading: FC = observer(() => {
  const {i18n} = useLingui();
  const torrent =
    UIStore.activeModal?.id === 'torrent-details' ? TorrentStore.torrents[UIStore.activeModal.hash] : undefined;
  const [torrentStatus, setTorrentStatus] = useState<'start' | 'stop'>('stop');

  useEffect(() => {
    if (torrent?.status.includes('stopped')) {
      setTorrentStatus('stop');
    } else {
      setTorrentStatus('start');
    }
  }, [torrent?.status]);

  if (torrent == null) {
    return null;
  }

  const torrentClasses = torrentStatusClasses(
    {
      status: torrent.status,
      upRate: torrent.upRate,
      downRate: torrent.downRate,
    },
    'torrent-details__header',
  );
  const torrentStatusIcon = torrentStatusIcons(torrent.status);

  return (
    <div className={torrentClasses}>
      <h1 className="torrent-details__heading torrent-details--name">{torrent.name}</h1>
      <div className="torrent-details__sub-heading">
        <ul className="torrent-details__sub-heading__secondary">
          <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--download">
            <DownloadThick />
            <Size value={torrent.downRate} isSpeed />
            &nbsp;&mdash;&nbsp;
            <Size value={torrent.bytesDone} />
          </li>
          <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--upload">
            <UploadThick />
            <Size value={torrent.upRate} isSpeed />
            &nbsp;&mdash;&nbsp;
            <Size value={torrent.upTotal} />
          </li>
          <li className="torrent-details__sub-heading__tertiary">
            <Ratio />
            {i18n.number(torrent.ratio)}
          </li>
          <li className="torrent-details__sub-heading__tertiary">
            <Clock />
            <Duration value={torrent.eta} />
          </li>
        </ul>
        <ul className="torrent-details__sub-heading__secondary">
          <li className="torrent-details__sub-heading__tertiary" key="priority-meter">
            <PriorityMeter
              id={torrent.hash}
              level={torrent.priority}
              maxLevel={3}
              priorityType="torrent"
              onChange={(hash, level) => {
                TorrentActions.setPriority({
                  hashes: [`${hash}`],
                  priority: level,
                });
              }}
            />
          </li>
          <li
            className={classnames('torrent-details__sub-heading__tertiary', 'torrent-details__action', {
              'is-active': torrentStatus === 'start',
            })}
            key="start"
            onClick={() => {
              setTorrentStatus('start');
              TorrentActions.startTorrents({
                hashes: [torrent.hash],
              });
            }}>
            <Start />
            <Trans id="torrents.details.actions.start" />
          </li>
          <li
            className={classnames('torrent-details__sub-heading__tertiary', 'torrent-details__action', {
              'is-active': torrentStatus === 'stop',
            })}
            key="stop"
            onClick={() => {
              setTorrentStatus('stop');
              TorrentActions.stopTorrents({
                hashes: [torrent.hash],
              });
            }}>
            <Stop />
            <Trans id="torrents.details.actions.stop" />
          </li>
        </ul>
      </div>
      <ProgressBar percent={Math.ceil(torrent.percentComplete)} icon={torrentStatusIcon} />
    </div>
  );
});

export default TorrentHeading;
