import {FC} from 'react';
import {observer} from 'mobx-react';
import {Trans, useLingui} from '@lingui/react';

import type {TorrentProperties} from '@shared/types/Torrent';

import LinkedText from '../../general/LinkedText';
import Size from '../../general/Size';
import TorrentStore from '../../../stores/TorrentStore';
import UIStore from '../../../stores/UIStore';

const getTags = (tags: TorrentProperties['tags']) =>
  tags.map((tag) => (
    <span className="tag" key={tag}>
      {tag}
    </span>
  ));

const TorrentGeneralInfo: FC = observer(() => {
  const {i18n} = useLingui();

  if (UIStore.activeModal?.id !== 'torrent-details') {
    return null;
  }

  const torrent = TorrentStore.torrents[UIStore.activeModal.hash];
  if (torrent == null) {
    return null;
  }

  const VALUE_NOT_AVAILABLE = (
    <span className="not-available">
      <Trans id="torrents.details.general.none" />
    </span>
  );

  return (
    <div className="torrent-details__section torrent-details__section--general">
      <table className="torrent-details__table table">
        <tbody>
          <tr className="torrent-details__table__heading">
            <td className="torrent-details__table__heading--tertiary" colSpan={2}>
              <Trans id="torrents.details.general.heading.general" />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--dateAdded">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.date.added" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.dateAdded > 0
                ? i18n.date(new Date(torrent.dateAdded * 1000), {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: 'numeric',
                    minute: 'numeric',
                  })
                : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--location">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.location" />
            </td>
            <td className="torrent-details__detail__value">{torrent.directory}</td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--tags">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.tags" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.tags.length ? getTags(torrent.tags) : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
          <tr className="torrent-details__table__heading">
            <td className="torrent-details__table__heading--tertiary" colSpan={2}>
              <Trans id="torrents.details.general.heading.transfer" />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--dateFinished">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.date.finished" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.dateFinished > 0
                ? i18n.date(new Date(torrent.dateFinished * 1000), {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: 'numeric',
                    minute: 'numeric',
                  })
                : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--downloaded">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.downloaded" />
            </td>
            <td className="torrent-details__detail__value">
              {i18n.number(torrent.percentComplete)}
              <em className="unit">%</em>
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--peers">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.peers" />
            </td>
            <td className="torrent-details__detail__value">
              <Trans
                id="torrents.details.general.connected"
                values={{
                  connectedCount: torrent.peersConnected,
                  connected: i18n.number(torrent.peersConnected),
                  total: i18n.number(torrent.peersTotal),
                }}
              />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--seeds">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.seeds" />
            </td>
            <td className="torrent-details__detail__value">
              <Trans
                id="torrents.details.general.connected"
                values={{
                  connectedCount: torrent.seedsConnected,
                  connected: i18n.number(torrent.seedsConnected),
                  total: i18n.number(torrent.seedsTotal),
                }}
              />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--dateActive">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.date.active" />
            </td>
            <td className="torrent-details__detail__value">
              {(() => {
                if (torrent.dateActive === 0) {
                  return VALUE_NOT_AVAILABLE;
                }

                if (torrent.dateActive === -1) {
                  return i18n._('torrents.details.general.date.active.now');
                }

                return i18n.date(new Date(torrent.dateActive * 1000), {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: 'numeric',
                  minute: 'numeric',
                });
              })()}
            </td>
          </tr>
          <tr className="torrent-details__table__heading">
            <td className="torrent-details__table__heading--tertiary" colSpan={2}>
              <Trans id="torrents.details.general.heading.torrent" />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--created">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.date.created" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.dateCreated > 0
                ? i18n.date(new Date(torrent.dateCreated * 1000), {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: 'numeric',
                    minute: 'numeric',
                  })
                : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--hash">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.hash" />
            </td>
            <td className="torrent-details__detail__value">{torrent.hash}</td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--size">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.size" />
            </td>
            <td className="torrent-details__detail__value">
              <Size value={torrent.sizeBytes} />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--type">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.type" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.isPrivate
                ? i18n._('torrents.details.general.type.private')
                : i18n._('torrents.details.general.type.public')}
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--comment">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.comment" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.comment ? <LinkedText text={torrent.comment.trim()} /> : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
          <tr className="torrent-details__table__heading">
            <td className="torrent-details__table__heading--tertiary" colSpan={2}>
              <Trans id="torrents.details.general.heading.tracker" />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--tracker-message">
            <td className="torrent-details__detail__label">
              <Trans id="torrents.details.general.tracker.message" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.message ? torrent.message : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default TorrentGeneralInfo;
