import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';

import ApplicationPanel from '../layout/ApplicationPanel';
import EventTypes from '../../constants/EventTypes';
import NavigationList from '../ui/NavigationList';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFiles from '../torrent-details/TorrentFiles';
import TorrentHeading from '../torrent-details/TorrentHeading';
import TorrentPeers from '../torrent-details/TorrentPeers';
import TorrentStore from '../../stores/TorrentStore';
import TorrentTrackers from '../torrent-details/TorrentTrackers';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'handleNavChange',
  'onTorrentDetailsHashChange',
  'onOpenChange',
  'onTorrentDetailsChange'
];

export default class TorrentDetails extends React.Component {
  constructor() {
    super();

    this.state = {
      isOpen: false,
      torrentDetailsSuccess: false,
      torrentDetailsError: false,
      selectedTorrent: {},
      selectedTorrentHash: null,
      torrentDetails: {},
      torrentDetailsPane: 'files'
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE, this.onTorrentDetailsChange);
    UIStore.listen(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE, this.onOpenChange);
    UIStore.listen(EventTypes.UI_TORRENT_DETAILS_HASH_CHANGE, this.onTorrentDetailsHashChange);
  }

  componentWillUnmount() {
    TorrentStore.stopPollingTorrentDetails();
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE, this.onTorrentDetailsChange);
    UIStore.unlisten(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE, this.onOpenChange);
    UIStore.unlisten(EventTypes.UI_TORRENT_DETAILS_HASH_CHANGE, this.onTorrentDetailsHashChange);
  }

  onTorrentDetailsHashChange() {
    if (this.state.isOpen) {
      TorrentStore.fetchTorrentDetails(UIStore.getTorrentDetailsHash());
    }
  }

  onOpenChange() {
    if (!UIStore.isTorrentDetailsOpen()) {
      TorrentStore.stopPollingTorrentDetails();
    } else {
      TorrentStore.fetchTorrentDetails(UIStore.getTorrentDetailsHash());
    }

    this.setState({
      isOpen: UIStore.isTorrentDetailsOpen()
    });
  }

  onTorrentDetailsChange() {
    this.setState({
      torrentDetails: TorrentStore.getTorrentDetails(UIStore.getTorrentDetailsHash())
    });
  }

  getNavigationItem(item) {
    let selectedHash = UIStore.getTorrentDetailsHash();
    let torrent = TorrentStore.getTorrent(selectedHash);
    let torrentDetails = this.state.torrentDetails || {};

    switch (item) {
      case 'files':
        return <TorrentFiles files={torrentDetails.files} torrent={torrent} />;
        break;
      case 'trackers':
        return <TorrentTrackers trackers={torrentDetails.trackers} />;
        break;
      case 'peers':
        return <TorrentPeers peers={torrentDetails.peers} />;
        break;
    }

    return null;
  }

  getNavigationItems() {
    return [
      {
        slug: 'files',
        label: 'Files'
      },
      {
        slug: 'peers',
        label: 'Peers'
      },
      {
        slug: 'trackers',
        label: 'Trackers'
      }
    ];
  }

  handleNavChange(item) {
    this.setState({torrentDetailsPane: item.slug});
  }

  render() {
    let detailContent = null;

    if (this.state.isOpen) {
      let selectedHash = UIStore.getTorrentDetailsHash();
      let torrent = TorrentStore.getTorrent(selectedHash);

      console.log(torrent.message);

      detailContent = (
        <div className="torrent-details">
          <TorrentHeading torrent={torrent} />
          <div className="torrent-details__content__wrapper">
            <NavigationList defaultItem={this.state.torrentDetailsPane}
              items={this.getNavigationItems()} onChange={this.handleNavChange}
              uniqueClassName="torrent-details__navigation" />
            <div className="torrent-details__content">
              {this.getNavigationItem(this.state.torrentDetailsPane)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <ApplicationPanel modifier="torrent-details">
        <CSSTransitionGroup
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
          transitionName="torrent-details">
          {detailContent}
        </CSSTransitionGroup>
      </ApplicationPanel>
    );
  }
}
