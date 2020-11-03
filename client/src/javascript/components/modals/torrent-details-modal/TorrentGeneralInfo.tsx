import {FormattedMessage, FormattedNumber, useIntl} from 'react-intl';
import {observer} from 'mobx-react';
import * as React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import Size from '../../general/Size';
import TorrentStore from '../../../stores/TorrentStore';
import UIStore from '../../../stores/UIStore';

const getTags = (tags: TorrentProperties['tags']) => {
  return tags.map((tag) => (
    <span className="tag" key={tag}>
      {tag}
    </span>
  ));
};

const TorrentGeneralInfo: React.FC = () => {
  if (UIStore.activeModal?.id !== 'torrent-details') {
    return null;
  }

  const torrent = TorrentStore.torrents[UIStore?.activeModal?.hash];
  if (torrent == null) {
    return null;
  }

  const intl = useIntl();

  let dateAdded = null;
  if (torrent.dateAdded) {
    dateAdded = new Date(torrent.dateAdded * 1000);
  }

  let creation = null;
  if (torrent.dateCreated) {
    creation = new Date(torrent.dateCreated * 1000);
  }

  const VALUE_NOT_AVAILABLE = (
    <span className="not-available">
      <FormattedMessage id="torrents.details.general.none" />
    </span>
  );

  return (
    <div className="torrent-details__section torrent-details__section--general">
      <table className="torrent-details__table table">
        <tbody>
          <tr className="torrent-details__table__heading">
            <td className="torrent-details__table__heading--tertiary" colSpan={2}>
              <FormattedMessage id="torrents.details.general.heading.general" />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--dateAdded">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.date.added" />
            </td>
            <td className="torrent-details__detail__value">
              {dateAdded
                ? `${intl.formatDate(dateAdded, {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                  })} ${intl.formatTime(dateAdded)}`
                : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--location">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.location" />
            </td>
            <td className="torrent-details__detail__value">{torrent.directory}</td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--tags">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.tags" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.tags.length ? getTags(torrent.tags) : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
          <tr className="torrent-details__table__heading">
            <td className="torrent-details__table__heading--tertiary" colSpan={2}>
              <FormattedMessage id="torrents.details.general.heading.transfer" />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--downloaded">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.downloaded" />
            </td>
            <td className="torrent-details__detail__value">
              <FormattedNumber value={torrent.percentComplete} />
              <em className="unit">%</em>
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--peers">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.peers" />
            </td>
            <td className="torrent-details__detail__value">
              <FormattedMessage
                id="torrents.details.general.connected"
                values={{
                  connectedCount: torrent.peersConnected,
                  connected: <FormattedNumber value={torrent.peersConnected} />,
                  total: <FormattedNumber value={torrent.peersTotal} />,
                }}
              />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--seeds">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.seeds" />
            </td>
            <td className="torrent-details__detail__value">
              <FormattedMessage
                id="torrents.details.general.connected"
                values={{
                  connectedCount: torrent.seedsConnected,
                  connected: <FormattedNumber value={torrent.seedsConnected} />,
                  total: <FormattedNumber value={torrent.seedsTotal} />,
                }}
              />
            </td>
          </tr>
          <tr className="torrent-details__table__heading">
            <td className="torrent-details__table__heading--tertiary" colSpan={2}>
              <FormattedMessage id="torrents.details.general.heading.torrent" />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--created">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.date.created" />
            </td>
            <td className="torrent-details__detail__value">
              {creation
                ? `${intl.formatDate(creation, {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                  })} ${intl.formatTime(creation)}`
                : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--hash">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.hash" />
            </td>
            <td className="torrent-details__detail__value">{torrent.hash}</td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--size">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.size" />
            </td>
            <td className="torrent-details__detail__value">
              <Size value={torrent.sizeBytes} />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--type">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.type" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.isPrivate
                ? intl.formatMessage({
                    id: 'torrents.details.general.type.private',
                  })
                : intl.formatMessage({
                    id: 'torrents.details.general.type.public',
                  })}
            </td>
          </tr>
          <tr className="torrent-details__table__heading">
            <td className="torrent-details__table__heading--tertiary" colSpan={2}>
              <FormattedMessage id="torrents.details.general.heading.tracker" />
            </td>
          </tr>
          <tr className="torrent-details__detail torrent-details__detail--tracker-message">
            <td className="torrent-details__detail__label">
              <FormattedMessage id="torrents.details.general.tracker.message" />
            </td>
            <td className="torrent-details__detail__value">
              {torrent.message ? torrent.message : VALUE_NOT_AVAILABLE}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default observer(TorrentGeneralInfo);
