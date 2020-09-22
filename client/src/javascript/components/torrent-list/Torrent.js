import React from 'react';

import ProgressBar from '../general/ProgressBar';
import torrentStatusIcons from '../../util/torrentStatusIcons';
import torrentStatusClasses from '../../util/torrentStatusClasses';
import TorrentDetail from './TorrentDetail';

const condensedValueTransformers = {
  downloadTotal: (torrent) => torrent.bytesDone,
  peers: (torrent) => torrent.peersConnected,
  percentComplete: (torrent) => (
    <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcons(torrent.status)} />
  ),
  seeds: (torrent) => torrent.seedsConnected,
};

const condensedSecondaryValueTransformers = {
  peers: (torrent) => torrent.peersTotal,
  seeds: (torrent) => torrent.seedsTotal,
};

const expandedTorrentSectionContent = {
  primary: ['name'],
  secondary: ['eta', 'downRate', 'upRate'],
  tertiary: ['*'],
};

const expandedTorrentDetailsToHide = ['downTotal'];

const expandedValueTransformers = {
  peers: (torrent) => torrent.peersConnected,
  seeds: (torrent) => torrent.seedsConnected,
};

const expandedSecondaryValueTransformers = {
  peers: (torrent) => torrent.peersTotal,
  seeds: (torrent) => torrent.seedsTotal,
  percentComplete: (torrent) => torrent.bytesDone,
};

const METHODS_TO_BIND = ['handleClick', 'handleDoubleClick', 'handleRightClick'];

const TORRENT_PRIMITIVES_TO_OBSERVE = ['bytesDone', 'downRate', 'peersTotal', 'seedsTotal', 'upRate'];

const TORRENT_ARRAYS_TO_OBSERVE = ['status', 'tags'];

class Torrent extends React.Component {
  static defaultProps = {
    isCondensed: false,
  };

  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (this.torrentRef != null) {
      this.torrentRef.addEventListener('long-press', this.handleRightClick);
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isSelected !== this.props.isSelected || nextProps.isCondensed !== this.props.isCondensed) {
      return true;
    }

    const nextTorrent = nextProps.torrent;
    const {torrent} = this.props;

    let shouldUpdate = TORRENT_ARRAYS_TO_OBSERVE.some((key) => {
      const nextArr = nextTorrent[key];
      const currentArr = this.props.torrent[key];

      return (
        nextArr.length !== currentArr.length || nextArr.some((nextValue, index) => nextValue !== currentArr[index])
      );
    });

    if (!shouldUpdate) {
      shouldUpdate = TORRENT_PRIMITIVES_TO_OBSERVE.some((key) => nextTorrent[key] !== torrent[key]);
    }

    if (!shouldUpdate) {
      shouldUpdate = Object.keys(nextProps.propWidths).some(
        (key) => nextProps.propWidths[key] !== this.props.propWidths[key],
      );
    }

    if (!shouldUpdate) {
      shouldUpdate = nextProps.columns.some(({id}, index) => id !== this.props.columns[index].id);
    }

    return shouldUpdate;
  }

  getTags(tags) {
    return tags.map((tag) => (
      <li className="torrent__tag" key={tag}>
        {tag}
      </li>
    ));
  }

  getWidth(slug) {
    const {defaultWidth, defaultPropWidths, propWidths} = this.props;

    return propWidths[slug] || defaultPropWidths[slug] || defaultWidth;
  }

  handleClick(event) {
    this.props.handleClick(this.props.torrent.hash, event);
  }

  handleDoubleClick(event) {
    this.props.handleDoubleClick(this.props.torrent, event);
  }

  handleRightClick(event) {
    if (!this.props.isSelected) {
      this.handleClick(event);
    }

    this.props.handleRightClick(this.props.torrent, event);
  }

  render() {
    const {isCondensed, isSelected, columns, torrent} = this.props;
    const torrentClasses = torrentStatusClasses(
      torrent,
      {
        'torrent--is-selected': isSelected,
        'torrent--is-condensed': isCondensed,
        'torrent--is-expanded': !isCondensed,
      },
      'torrent',
    );

    if (isCondensed) {
      const torrentPropertyColumns = columns.reduce((accumulator, {id, visible}) => {
        if (!visible) {
          return accumulator;
        }

        let value = torrent[id];
        let secondaryValue;

        if (id in condensedValueTransformers) {
          value = condensedValueTransformers[id](torrent);
        }

        if (id in condensedSecondaryValueTransformers) {
          secondaryValue = condensedSecondaryValueTransformers[id](torrent);
        }

        accumulator.push(
          <TorrentDetail
            className="table__cell"
            key={id}
            preventTransform={id === 'percentComplete'}
            secondaryValue={secondaryValue}
            slug={id}
            value={value}
            width={this.getWidth(id)}
          />,
        );

        return accumulator;
      }, []);

      return (
        <li
          className={torrentClasses}
          onClick={this.handleClick}
          onContextMenu={this.handleRightClick}
          onDoubleClick={this.handleDoubleClick}
          ref={(ref) => {
            this.torrentRef = ref;
          }}>
          {torrentPropertyColumns}
        </li>
      );
    }

    const sections = {primary: [], secondary: [], tertiary: []};

    // Using a for loop to maximize performance.
    for (let index = 0; index < columns.length; index++) {
      const {id, visible} = columns[index];

      if (visible && !expandedTorrentDetailsToHide.includes(id)) {
        let value = torrent[id];
        let secondaryValue;

        if (id in expandedValueTransformers) {
          value = expandedValueTransformers[id](torrent);
        }

        if (id in expandedSecondaryValueTransformers) {
          secondaryValue = expandedSecondaryValueTransformers[id](torrent);
        }

        if (expandedTorrentSectionContent.primary.includes(id)) {
          sections.primary.push(
            <TorrentDetail
              key={id}
              className="torrent__details__section torrent__details__section--primary"
              slug={id}
              value={value}
            />,
          );
        } else if (expandedTorrentSectionContent.secondary.includes(id)) {
          sections.secondary[expandedTorrentSectionContent.secondary.indexOf(id)] = (
            <TorrentDetail icon key={id} secondaryValue={secondaryValue} slug={id} value={value} />
          );
        } else {
          sections.tertiary.push(
            <TorrentDetail icon key={id} secondaryValue={secondaryValue} slug={id} value={value} />,
          );
        }
      }
    }

    return (
      <li
        className={torrentClasses}
        onClick={this.handleClick}
        onContextMenu={this.handleRightClick}
        onDoubleClick={this.handleDoubleClick}
        ref={(ref) => {
          this.torrentRef = ref;
        }}>
        <div className="torrent__details__section__wrapper">
          {sections.primary}
          <div className="torrent__details__section torrent__details__section--secondary">{sections.secondary}</div>
        </div>
        <div className="torrent__details__section torrent__details__section--tertiary">{sections.tertiary}</div>
        <div className="torrent__details__section torrent__details__section--quaternary">
          <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcons(torrent.status)} />
        </div>
      </li>
    );
  }
}

export default Torrent;
