import {FormattedMessage} from 'react-intl';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = ['getFilters', 'handleClick', 'onTagFilterChange', 'onTorrentTaxonomyChange'];

export default class TagFilters extends React.Component {
  constructor() {
    super();

    this.state = {
      tagCount: {},
      tagFilter: TorrentFilterStore.getTagFilter(),
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentFilterStore.listen(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS, this.onTorrentTaxonomyChange);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_TAG_CHANGE, this.onTagFilterChange);
  }

  componentWillUnmount() {
    TorrentFilterStore.unlisten(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS, this.onTorrentTaxonomyChange);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_TAG_CHANGE, this.onTagFilterChange);
  }

  getFilters() {
    const filterItems = Object.keys(this.state.tagCount).sort((a, b) => {
      if (a === 'all' || a === 'untagged') {
        return -1;
      }
      if (b === 'all' || b === 'untagged') {
        return 1;
      }

      return a.localeCompare(b);
    });

    const filterElements = filterItems.map(filter => (
      <SidebarFilter
        handleClick={this.handleClick}
        count={this.state.tagCount[filter] || 0}
        key={filter}
        isActive={filter === this.state.tagFilter}
        name={filter}
        slug={filter}
      />
    ));

    return filterElements;
  }

  handleClick(filter) {
    UIActions.setTorrentTagFilter(filter);
  }

  hasTags() {
    const tags = Object.keys(this.state.tagCount);

    return !((tags.length === 1 && tags[0] === 'all') || (tags.length === 2 && tags[1] === 'untagged'));
  }

  onTagFilterChange() {
    this.setState({tagFilter: TorrentFilterStore.getTagFilter()});
  }

  onTorrentTaxonomyChange() {
    const tagCount = TorrentFilterStore.getTorrentTagCount();
    this.setState({tagCount});
  }

  render() {
    if (!this.hasTags()) {
      return null;
    }

    return (
      <ul className="sidebar-filter sidebar__item">
        <li className="sidebar-filter__item sidebar-filter__item--heading">
          <FormattedMessage id="filter.tag.title" defaultMessage="Filter by Tag" />
        </li>
        {this.getFilters()}
      </ul>
    );
  }
}
