import classNames from 'classnames';
import React from 'react';

import UIActions from '../../actions/UIActions';

class HeaderItem extends React.Component {

  constructor() {
    super();
  }

  render() {

    let isSorted = this.props.sortCriteria.property === this.props.propertylet;

    let classes = classNames({
      'is-sorted': isSorted,
      'is-sorted--asc': isSorted && (this.props.sortCriteria.direction === 'asc'),
      'is-sorted--desc': isSorted && (this.props.sortCriteria.direction === 'desc'),
      'torrent__header__item': true,
      'torrent__detail--primary': this.props.primary,
      'torrent__detail--secondary--sub': !this.props.primary
    });

    classes += ' torrent__detail--' + this.props.slug;

    return (
      <span className={classes} onClick={this._onClick}>{this.props.label}</span>
    );
  }

  _onClick() {
    let newDirection = this.props.sortCriteria.direction === 'asc' ? 'desc' : 'asc';
    UIActions.sortTorrents(this.props.propertylet, newDirection);
  }

}

export default class TorrentListHeader extends React.Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div className="torrent__header">
        <HeaderItem primary="true" label="Name" slug="name" propertylet="name" sortCriteria={this.props.sortCriteria} />
        <div className="torrent__detail--secondary">
          <HeaderItem label="Up" slug="speed" propertylet="uploadRate" sortCriteria={this.props.sortCriteria} />
          <HeaderItem label="Down" slug="speed" propertylet="downloadRate" sortCriteria={this.props.sortCriteria} />
          <HeaderItem label="ETA" slug="eta" propertylet="eta" sortCriteria={this.props.sortCriteria} />
          <HeaderItem label="Completed" slug="completed" propertylet="percentComplete" sortCriteria={this.props.sortCriteria} />
          <HeaderItem label="Size" slug="size" propertylet="sizeBytes" sortCriteria={this.props.sortCriteria} />
          <HeaderItem label="Ratio" slug="ratio" propertylet="ratio" sortCriteria={this.props.sortCriteria} />
          <HeaderItem label="Peers" slug="peers" propertylet="name" sortCriteria={this.props.sortCriteria} />
          <HeaderItem label="Seeds" slug="seeds" propertylet="name" sortCriteria={this.props.sortCriteria} />
        </div>
      </div>
    );
  }

}
