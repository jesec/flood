import {FormattedMessage} from 'react-intl';
import React from 'react';

import connectStores from '../../util/connectStores';
import EventTypes from '../../constants/EventTypes';
import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

class TagFilters extends React.Component {
  getFilters() {
    const filterItems = Object.keys(this.props.tagCount).sort((a, b) => {
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
        count={this.props.tagCount[filter] || 0}
        key={filter}
        isActive={filter === this.props.tagFilter}
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
    const tags = Object.keys(this.props.tagCount);

    return !((tags.length === 1 && tags[0] === 'all') || (tags.length === 2 && tags[1] === 'untagged'));
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

const ConnectedTagFilters = connectStores(TagFilters, () => {
  return [
    {
      store: TorrentFilterStore,
      event: EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS,
      getValue: ({store}) => {
        return {
          tagCount: store.getTorrentTagCount(),
        };
      },
    },
    {
      store: TorrentFilterStore,
      event: EventTypes.UI_TORRENTS_FILTER_TAG_CHANGE,
      getValue: ({store}) => {
        return {
          tagFilter: store.getTagFilter(),
        };
      },
    },
  ];
});

export default ConnectedTagFilters;
