import {injectIntl} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import Close from '../icons/Close';
import connectStores from '../../util/connectStores';
import EventTypes from '../../constants/EventTypes';
import Search from '../icons/Search';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

class SearchBox extends React.Component {
  state = {
    inputFieldKey: 0,
    isSearchActive: false,
  };

  componentDidMount() {
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_CLEAR, this.resetSearch);
  }

  componentWillUnmount() {
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_CLEAR, this.resetSearch);
  }

  handleSearchChange = event => {
    const {value} = event.target;
    this.setState({isSearchActive: value !== ''});
    UIActions.setTorrentsSearchFilter(value);
  };

  handleResetClick = () => {
    this.resetSearch();
    UIActions.setTorrentsSearchFilter('');
  };

  resetSearch = () => {
    this.setState(state => {
      return {
        inputFieldKey: state.inputFieldKey + 1,
        isSearchActive: false,
      };
    });
  };

  render() {
    const {inputFieldKey, isSearchActive} = this.state;
    let clearSearchButton = null;
    const classes = classnames({
      sidebar__item: true,
      search: true,
      'is-in-use': isSearchActive,
    });

    if (isSearchActive) {
      clearSearchButton = (
        <button className="button search__reset-button" onClick={this.handleResetClick}>
          <Close />
        </button>
      );
    }

    return (
      <div className={classes}>
        {clearSearchButton}
        <Search />
        <input
          className="textbox"
          key={inputFieldKey}
          type="text"
          placeholder={this.props.intl.formatMessage({
            id: 'sidebar.search.placeholder',
            defaultMessage: 'Search torrents',
          })}
          onChange={this.handleSearchChange}
        />
      </div>
    );
  }
}

const ConnectedSearchBox = connectStores(injectIntl(SearchBox), () => {
  return [
    {
      store: TorrentFilterStore,
      event: EventTypes.UI_TORRENTS_FILTER_SEARCH_CHANGE,
      getValue: ({store}) => {
        return {
          searchValue: store.getSearchFilter(),
        };
      },
    },
  ];
});

export default ConnectedSearchBox;
