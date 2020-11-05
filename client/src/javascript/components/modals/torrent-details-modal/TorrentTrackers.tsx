import {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import {observable, runInAction} from 'mobx';
import {observer} from 'mobx-react';

import type {TorrentTracker} from '@shared/types/TorrentTracker';

import Badge from '../../general/Badge';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

@observer
class TorrentTrackers extends Component<unknown> {
  trackers = observable.array<TorrentTracker>([]);

  constructor(props: unknown) {
    super(props);

    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchTorrentTrackers(UIStore.activeModal?.hash).then((trackers) => {
        if (trackers != null) {
          runInAction(() => {
            this.trackers.replace(trackers);
          });
        }
      });
    }
  }

  render() {
    const trackerCount = this.trackers.length;
    const trackerTypes = ['http', 'udp', 'dht'];

    const trackerDetails = this.trackers.map((tracker) => (
      <tr key={tracker.url}>
        <td>{tracker.url}</td>
        <td>{trackerTypes[tracker.type - 1]}</td>
      </tr>
    ));

    return (
      <div className="torrent-details__trackers torrent-details__section">
        <table className="torrent-details__table table">
          <thead className="torrent-details__table__heading">
            <tr>
              <th className="torrent-details__table__heading--primary">
                <FormattedMessage id="torrents.details.trackers" />
                <Badge>{trackerCount}</Badge>
              </th>
              <th className="torrent-details__table__heading--secondary">
                <FormattedMessage id="torrents.details.trackers.type" />
              </th>
            </tr>
          </thead>
          <tbody>{trackerDetails}</tbody>
        </table>
      </div>
    );
  }
}

export default TorrentTrackers;
