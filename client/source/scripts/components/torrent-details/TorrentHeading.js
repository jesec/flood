import classNames from 'classnames';
import React from 'react';

import FolderOpenSolid from '../icons/FolderOpenSolid';
import DirectoryTree from '../filesystem/DirectoryTree';
import Download from '../icons/Download';
import ETA from '../icons/ETA';
import File from '../icons/File';
import format from '../../util/formatData';
import ProgressBar from '../ui/ProgressBar';
import Ratio from '../../components/icons/Ratio';
import Upload from '../icons/Upload';

export default class TorrentHeading extends React.Component {
  render() {
    let torrent = this.props.torrent;
    let completed = format.data(torrent.bytesDone);
    let downloadRate = format.data(torrent.downloadRate, '/s');
    let downloadTotal = format.data(torrent.downloadTotal);
    let eta = format.eta(torrent.eta);
    let ratio = format.ratio(torrent.ratio);
    let uploadRate = format.data(torrent.uploadRate, '/s');
    let uploadTotal = format.data(torrent.uploadTotal);

    let classes = classNames('torrent-details__heading', {
      'has-error': torrent.status.indexOf('has-error') > -1,
      'is-selected': this.props.selected,
      'is-stopped': torrent.status.indexOf('is-stopped') > -1,
      'is-paused': torrent.status.indexOf('is-paused') > -1,
      'is-actively-downloading': downloadRate.value > 0,
      'is-downloading': torrent.status.indexOf('is-downloading') > -1,
      'is-seeding': torrent.status.indexOf('is-seeding') > -1,
      'is-completed': torrent.status.indexOf('is-completed') > -1,
      'is-checking': torrent.status.indexOf('is-checking') > -1,
      'is-active': torrent.status.indexOf('is-active') > -1,
      'is-inactive': torrent.status.indexOf('is-inactive') > -1
    });

    return (
      <div className={classes}>
        <h1 className="torrent__details--name">{torrent.name}</h1>
        <ul className="torrent__details torrent__details--tertiary">
          <li className="torrent__details--download transfer-data--download">
            <Download />
            {downloadRate.value}
            <em className="unit">{downloadRate.unit}</em>
              &nbsp;&mdash;&nbsp;
              {completed.value}
              <em className="unit">{completed.unit}</em>
          </li>
          <li className="torrent__details--upload transfer-data--upload">
            <Upload />
            {uploadRate.value}
            <em className="unit">{uploadRate.unit}</em>
            &nbsp;&mdash;&nbsp;
            {uploadTotal.value}
            <em className="unit">{uploadTotal.unit}</em>
          </li>
          <li className="torrent__details--ratio">
            <Ratio />
            {ratio}
          </li>
          <li className="torrent__details--eta">
            <ETA />
            {eta}
          </li>
        </ul>
        <ProgressBar percent={torrent.percentComplete} />
      </div>
    );
  }
}
