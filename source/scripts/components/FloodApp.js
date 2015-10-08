import React from 'react';

import ActionBar from './action-bar/ActionBar';
import FilterBar from './filter-bar/FilterBar';
import TorrentList from './torrent-list/TorrentList';
import TorrentListHeader from './torrent-list/TorrentListHeader';
import TorrentStore from '../stores/TorrentStore';
import UIStore from '../stores/UIStore';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
  '_onSortChange'
];

export default class FloodApp extends React.Component {

  constructor() {
    super();

    this.state = {
      sortCriteria: {
        direction: 'asc',
        property: 'name'
      }
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.addSortChangeListener(this._onSortChange);
  }

  componentWillUnmount() {
    TorrentStore.removeSortChangeListener(this._onSortChange);
  }

  render() {
    return (
      <div className="flood">
        <FilterBar />
        <main className="main">
          <ActionBar />
          <TorrentList />
        </main>
      </div>
    );
  }

  _onSortChange() {
    this.setState({
      sortCriteria: TorrentStore.getSortCriteria()
    });
  }

}
