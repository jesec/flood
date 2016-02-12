import classnames from 'classnames';
import React from 'react';

import ActionBar from '../torrent-list/ActionBar';
import ApplicationPanel from '../layout/ApplicationPanel';
import EventTypes from '../../constants/EventTypes';
import TorrentListContainer from '../torrent-list/TorrentListContainer';
import TorrentStore from '../../stores/TorrentStore';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = ['onOpenChange'];

class TorrentListView extends React.Component {
  constructor() {
    super();

    this.state = {
      isTorrentDetailsOpen: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    UIStore.listen(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE, this.onOpenChange);
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE, this.onOpenChange);
  }

  onOpenChange() {
    this.setState({
      isTorrentDetailsOpen: UIStore.isTorrentDetailsOpen()
    });
  }

  render() {
    let classes = classnames({'is-open': this.state.isTorrentDetailsOpen}, 'view--torrent-list');

    return (
      <ApplicationPanel modifier="torrent-list" className={classes}>
        <ActionBar />
        <TorrentListContainer />
      </ApplicationPanel>
    );
  }
}

TorrentListView.propTypes = {
  children: React.PropTypes.node
};

export default TorrentListView;
