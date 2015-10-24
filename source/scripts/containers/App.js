import { connect } from 'react-redux';
import React from 'react';

import ActionBar from '../containers/ActionBar';
import { fetchTorrents } from '../actions/ClientActions';
import FilterBar from '../components/filter-bar/FilterBar';
import rootSelector from '../selectors/rootSelector';
import TorrentList from '../containers/TorrentList';
import TorrentListHeader from '../components/torrent-list/TorrentListHeader';

const methodsToBind = [
  'componentWillMount',
  'componentWillUnmount',
  'getClientData'
];

class FloodApp extends React.Component {

  constructor() {
    super();

    this.state = {
      count: 0,
      dataFetchInterval: null
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let getClientData = this.getClientData;

    this.state.dataFetchInterval = setInterval(function() {
      getClientData();
    }, 5000);

    getClientData();
  }

  componentWillUnmount() {
    clearInterval(this.state.dataFetchInterval);
  }

  getClientData() {
    this.props.dispatch(fetchTorrents());
  }

  render() {
    return (
      <div className="flood">
        <FilterBar />
        <main className="main">
          <ActionBar dispatch={this.props.dispatch} uiStore={this.props.ui} />
          <TorrentList dispatch={this.props.dispatch}
            selectedTorrents={this.props.ui.torrentList.selected}
            torrents={this.props.torrents}
            uiStore={this.props.ui}
            isFetching={this.props.ui.fetchingData} />
        </main>
      </div>
    );
  }

}

export default connect(rootSelector)(FloodApp);
