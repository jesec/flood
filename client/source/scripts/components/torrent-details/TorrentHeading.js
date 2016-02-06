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
import {torrentStatusClasses} from '../../util/torrentStatusClasses';
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

    let torrentClasses = torrentStatusClasses(torrent, 'torrent-details__heading');

    return (
      <div className={torrentClasses}>
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
