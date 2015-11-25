import _ from 'lodash';
import classNames from 'classnames';
import {connect} from 'react-redux';
import React from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';

import format from '../../util/formatData';
import Icon from '../icons/Icon';
import clientSelector from '../../selectors/clientSelector';

const methodsToBind = [
  'getFileData',
  'getFileTreeDomNodes',
  'getFileTreeFromPaths',
  'getHeading',
  'getSidePanel'
];

class TorrentDetails extends React.Component {

  constructor() {
    super();

    this.state = {
      selectedTorrentHash: null
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === true) {
      let nextHash = nextProps.selectedTorrents[0];
      this.setState({
        selectedTorrentHash: nextHash,
        selectedTorrent: _.find(nextProps.torrents, torrent => {
          return torrent.hash === nextHash;
        })
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.visible === true ||
      (nextProps.visible !== this.props.visible)) {
      return true;
    } else {
      return false;
    }
  }

  getFileTreeDomNodes(tree) {
    return Object.keys(tree).map(branchName => {
      let branch = tree[branchName];
      let domNodes = [];

      if (branchName === 'files') {
        branch.sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
        domNodes = branch.map(file => {
          return <div>{file.filename}</div>
        });
      } else {
        domNodes.push(<div><strong>{branchName}</strong></div>);
        domNodes.push(this.getFileTreeDomNodes(tree[branchName]));
      }

      return domNodes;
    });
  }

  getFileTreeFromPaths(tree = {}, directory, file, depth = 0) {
    if (depth < file.pathComponents.length - 1) {
      depth++;
      tree[directory] = this.getFileTreeFromPaths(tree[directory], file.pathComponents[depth], file, depth);
    } else {
      if (!tree.files) {
        tree.files = [];
      }
      tree.files.push(file);
    }
    return tree;
  }

  getFileList(files) {
    let tree = {};

    files.forEach(file => {
      tree = this.getFileTreeFromPaths(tree, file.pathComponents[0], file);
    });

    let directoryTree = this.getFileTreeDomNodes(tree);

    return directoryTree;
  }

  getFileData(torrent, files) {
    let parentDirectory = torrent.directory;
    let filename = torrent.filename;

    if (files) {
      // We've received full file details from the client.
      return (
        <div className="torrent-details__file-data torrent-details__section">
          <div className="torrent-details__file-data__item
            torrent-details__file-data__directory">
            {parentDirectory}
          </div>
          {this.getFileList(files)}
        </div>
      );
    } else {
      // We've only received the top-level file details from the torrent list.
      return (
        <div className="torrent-details__file-data torrent-details__section">
          <div className="torrent-details__file-data__item
            torrent-details__file-data__directory">
            {parentDirectory}
          </div>
          <div className="torrent-details__file-data__item
            torrent-details__file-data__filename
            torrent-details__file-data__depth--1">
            {filename}
          </div>
        </div>
      );
    }
  }

  getHeading() {
    // return (
    //   <div className="torrent-details__actions torrent-details__section">
    //     Dropdown
    //   </div>
    // );
  }

  getPeerList(peers) {
    if (peers) {
      let peerList = null;
      let peerCount = 0;

      peerList = peers.map(function(peer, index) {
        let downloadRate = format.data(peer.downloadRate, '/s');
        let uploadRate = format.data(peer.uploadRate, '/s');
        return (
          <tr key={index}>
            <td>{peer.address}</td>
            <td>
              {downloadRate.value}
              <em className="unit">{downloadRate.unit}</em>
            </td>
            <td>
              {uploadRate.value}
              <em className="unit">{uploadRate.unit}</em>
            </td>
          </tr>
        );
      });
      peerCount = peerList.length;

      return (
        <div className="torrent-details__peers torrent-details__section">
          <table className="torrent-details__table table">
            <thead className="torrent-details__table__heading">
              <tr>
                <th>
                  Peers
                  <span className="torrent-details__table__heading__count">
                    {peerCount}
                  </span>
                </th>
                <th>DL</th>
                <th>UL</th>
              </tr>
            </thead>
            <tbody>
              {peerList}
            </tbody>
          </table>
        </div>
      )
    }
  }

  getSidePanel() {
    if (!this.props.visible) {
      return null;
    }

    let torrent = this.state.selectedTorrent;
    let added = new Date(torrent.added * 1000);
    let addedString = (added.getMonth() + 1) + '/' + added.getDate() + '/' +
      added.getFullYear();
    let completed = format.data(torrent.bytesDone);
    let downloadRate = format.data(torrent.downloadRate, '/s');
    let downloadTotal = format.data(torrent.downloadTotal);
    let eta = format.eta(torrent.eta);
    let ratio = format.ratio(torrent.ratio);
    let totalSize = format.data(torrent.sizeBytes);
    let torrentDetails = this.props.torrentDetails[
      this.state.selectedTorrentHash
    ] || {};
    let uploadRate = format.data(torrent.uploadRate, '/s');
    let uploadTotal = format.data(torrent.uploadTotal);

    return (
      <div className="torrent-details" key={this.props.visible}>
        {this.getHeading()}
        <ul className="torrent-details__transfer-data torrent-details__section">
          <li className="transfer-data transfer-data--download">
            <Icon icon="download" />
            {downloadRate.value}
            <em className="unit">{downloadRate.unit}</em>
          </li>
          <li className="transfer-data transfer-data--upload">
            <Icon icon="upload" />
            {uploadRate.value}
            <em className="unit">{uploadRate.unit}</em>
          </li>
          <li className="transfer-data transfer-data--ratio">
            <Icon icon="ratio" />
            1<em className="unit">yr</em>
          </li>
          <li className="transfer-data transfer-data--eta">
            <Icon icon="download" />
            1<em className="unit">yr</em>
          </li>
        </ul>
        {this.getFileData(torrent, torrentDetails.files)}
        {this.getPeerList(torrentDetails.peers)}
      </div>
    );
  }

  render() {
    return (
      <CSSTransitionGroup
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        transitionName="torrent-details">
        {this.getSidePanel()}
      </CSSTransitionGroup>
    );
  }

}

export default connect(clientSelector)(TorrentDetails);
