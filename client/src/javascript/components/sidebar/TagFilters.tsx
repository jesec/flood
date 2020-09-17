import {FormattedMessage} from 'react-intl';
import React from 'react';

import connectStores from '../../util/connectStores';
import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

interface TagFiltersProps {
  tagCount?: Record<string, number>;
  tagFilter?: string;
}

class TagFilters extends React.Component<TagFiltersProps> {
  static handleClick(filter: string) {
    UIActions.setTorrentTagFilter(filter);
  }

  getFilters() {
    if (this.props.tagCount == null) {
      return null;
    }

    const filterItems = Object.keys(this.props.tagCount).sort((a, b) => {
      if (a === 'all' || a === 'untagged') {
        return -1;
      }
      if (b === 'all' || b === 'untagged') {
        return 1;
      }

      return a.localeCompare(b);
    });

    const filterElements = filterItems.map((filter) => (
      <SidebarFilter
        handleClick={TagFilters.handleClick}
        count={(this.props.tagCount != null && this.props.tagCount[filter]) || 0}
        key={filter}
        isActive={filter === this.props.tagFilter}
        name={filter}
        slug={filter}
      />
    ));

    return filterElements;
  }

  hasTags(): boolean {
    if (this.props.tagCount == null) {
      return false;
    }

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
          <FormattedMessage id="filter.tag.title" />
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
      event: 'CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS',
      getValue: ({store}) => {
        const storeTorrentFilter = store as typeof TorrentFilterStore;
        return {
          tagCount: storeTorrentFilter.getTorrentTagCount(),
        };
      },
    },
    {
      store: TorrentFilterStore,
      event: 'UI_TORRENTS_FILTER_TAG_CHANGE',
      getValue: ({store}) => {
        const storeTorrentFilter = store as typeof TorrentFilterStore;
        return {
          tagFilter: storeTorrentFilter.getTagFilter(),
        };
      },
    },
  ];
});

export default ConnectedTagFilters;
