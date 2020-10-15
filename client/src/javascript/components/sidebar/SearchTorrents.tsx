import {injectIntl, WrappedComponentProps} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import Close from '../icons/Close';
import connectStores from '../../util/connectStores';
import Search from '../icons/Search';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

interface SearchBoxStates {
  inputFieldKey: number;
  isSearchActive: boolean;
}

class SearchBox extends React.Component<WrappedComponentProps, SearchBoxStates> {
  constructor(props: WrappedComponentProps) {
    super(props);
    this.state = {
      inputFieldKey: 0,
      isSearchActive: false,
    };
  }

  componentDidMount() {
    TorrentFilterStore.listen('UI_TORRENTS_FILTER_CLEAR', this.resetSearch);
  }

  componentWillUnmount() {
    TorrentFilterStore.unlisten('UI_TORRENTS_FILTER_CLEAR', this.resetSearch);
  }

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;
    this.setState({isSearchActive: value !== ''});
    UIActions.setTorrentsSearchFilter(value);
  };

  handleResetClick = () => {
    this.resetSearch();
    UIActions.setTorrentsSearchFilter('');
  };

  resetSearch = () => {
    this.setState((state) => {
      return {
        inputFieldKey: state.inputFieldKey + 1,
        isSearchActive: false,
      };
    });
  };

  render() {
    const {intl} = this.props;
    const {inputFieldKey, isSearchActive} = this.state;
    let clearSearchButton = null;
    const classes = classnames({
      sidebar__item: true, // eslint-disable-line
      search: true,
      'is-in-use': isSearchActive,
    });

    if (isSearchActive) {
      clearSearchButton = (
        <button className="button search__reset-button" onClick={this.handleResetClick} type="button">
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
          placeholder={intl.formatMessage({
            id: 'sidebar.search.placeholder',
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
      event: 'UI_TORRENTS_FILTER_SEARCH_CHANGE',
      getValue: ({store}) => {
        const storeTorrentFilter = store as typeof TorrentFilterStore;
        return {
          searchValue: storeTorrentFilter.getSearchFilter(),
        };
      },
    },
  ];
});

export default ConnectedSearchBox;
