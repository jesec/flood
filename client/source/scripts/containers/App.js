import { connect } from 'react-redux';
import React from 'react';

import ActionBar from '../containers/ActionBar';
import Modals from '../components/modals/Modals';
import Sidebar from './Sidebar';
import rootSelector from '../selectors/rootSelector';
import TorrentList from '../containers/TorrentList';
import TorrentListHeader from '../components/torrent-list/TorrentListHeader';

const methodsToBind = [
  // 'componentWillMount',
  // 'componentWillUnmount',
  // 'getTransferData',
  // 'getTorrents'
];

export default class FloodApp extends React.Component {

  constructor() {
    super();

    this.state = {
      clientDataFetchInterval: null,
      count: 0,
      torrentFetchInterval: null
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }
  //
  // componentWillMount() {
  //   let getTorrents = this.getTorrents;
  //   let getTransferData = this.getTransferData;
  //
  //   this.state.torrentFetchInterval = setInterval(function() {
  //     getTorrents();
  //   }, 5000);
  //
  //   this.state.clientDataFetchInterval = setInterval(function() {
  //     getTransferData();
  //   }, 5000);
  //
  //   this.getTorrents();
  //   this.getTransferData();
  // }
  //
  // componentWillUnmount() {
  //   clearInterval(this.state.torrentFetchInterval);
  //   clearInterval(this.state.clientDataFetchInterval);
  // }

  render() {
    return (
      <div className="flood">
        <Sidebar />
        <main className="content">
          <ActionBar />
          <TorrentList />
        </main>
        <Modals />
      </div>
    );
  }

  // render() {
  //   return (
  //     <div className="flood">
  //       <Sidebar dispatch={this.props.dispatch}
  //         filterBy={this.props.ui.torrentList.filterBy}
  //         transferData={this.props.client.transfers}/>
  //       <main className="content">
  //         <ActionBar dispatch={this.props.dispatch} uiStore={this.props.ui} />
  //         <TorrentList dispatch={this.props.dispatch}
  //           selectedTorrents={this.props.ui.torrentList.selected}
  //           torrents={this.props.torrents}
  //           isFetching={this.props.ui.fetchingData} />
  //       </main>
  //       <Modals dispatch={this.props.dispatch} type={this.props.ui.modal} />
  //     </div>
  //   );
  // }

}

// export default connect(rootSelector)(FloodApp);
