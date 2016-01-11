import classNames from 'classnames';
import React from 'react';

import DotsMini from '../icons/DotsMini';
import format from '../../util/formatData';
import ProgressBar from './ProgressBar';

const METHODS_TO_BIND = [
  'handleClick',
  'handleRightClick'
];

export default class Torrent extends React.Component {

  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleClick(event) {
    this.props.handleClick(this.props.data.hash, event);
  }

  handleRightClick(event) {
    console.log(event);
  }

  render() {
    let torrent = this.props.data;
    let added = new Date(torrent.added * 1000);
    let addedString = (added.getMonth() + 1) + '/' + added.getDate() + '/' +
      added.getFullYear();
    let completed = format.data(torrent.bytesDone);
    let downloadRate = format.data(torrent.downloadRate, '/s');
    let downloadTotal = format.data(torrent.downloadTotal);
    let eta = format.eta(torrent.eta);
    let ratio = format.ratio(torrent.ratio);
    let totalSize = format.data(torrent.sizeBytes);
    let uploadRate = format.data(torrent.uploadRate, '/s');
    let uploadTotal = format.data(torrent.uploadTotal);

    let classes = classNames({
      'torrent': true,
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
      <li
        className={classes}
        onMouseDown={this.handleClick}
        onContextMenu={this.handleRightClick}>
        <ul className="torrent__details">
          <li className="torrent__details--primary text-overflow">
            {torrent.name}
          </li>
          <li className="torrent__details--secondary">
            <ul className="torrent__details">
              <li className="torrent__details--eta">
                {eta}
              </li>
              <li className="torrent__details--speed">
                {downloadRate.value}
                <em className="unit">{downloadRate.unit}</em>
              </li>
              <li className="torrent__details--speed">
                {uploadRate.value}
                <em className="unit">{uploadRate.unit}</em>
              </li>
              <li className="torrent__details--ratio">
                {ratio}
              </li>
            </ul>
          </li>
        </ul>
        <ul className="torrent__details torrent__details--tertiary">
          <li className="torrent__details--completed">
            <span className="torrent__details__label">Downloaded</span>
            {torrent.percentComplete}
            <em className="unit">%</em>
            &nbsp;&mdash;&nbsp;
            {completed.value}
            <em className="unit">{completed.unit}</em>
          </li>
          <li className="torrent__details--uploaded">
            <span className="torrent__details__label">Uploaded</span>
            {uploadTotal.value}
            <em className="unit">{uploadTotal.unit}</em>
          </li>
          <li className="torrent__details--size">
            <span className="torrent__details__label">Size</span>
            {totalSize.value}
            <em className="unit">{totalSize.unit}</em>
          </li>
          <li className="torrent__details--added">
            <span className="torrent__details__label">Added</span>
            {addedString}
          </li>
        </ul>
        <ProgressBar percent={torrent.percentComplete} />
        <button className="torrent__more-info floating-action__button"
          onClick={this.props.handleDetailsClick.bind(this, torrent)}>
          <DotsMini size="mini" />
        </button>
      </li>
    );
  }

}
