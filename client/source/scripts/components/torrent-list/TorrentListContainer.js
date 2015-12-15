import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';

import TorrentDetails from './TorrentDetails';
import TorrentList from './TorrentList';

const methodsToBind = [
  'toggleDetailsPanel'
];

export default class TorrentListContainer extends React.Component {
  constructor() {
    super();

    this.state = {
      detailsPanelOpen: false
    };
  }

  render() {
    let classes = classNames({
      'torrents': true
    });

    return (
      <div className={classes}>
        <TorrentList />
        <TorrentDetails />
      </div>
    );
  }

}
