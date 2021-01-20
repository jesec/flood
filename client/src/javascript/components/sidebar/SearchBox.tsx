import {Component, ChangeEvent} from 'react';
import classnames from 'classnames';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {reaction} from 'mobx';

import {Close, Search} from '@client/ui/icons';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';
import UIActions from '@client/actions/UIActions';

interface SearchBoxStates {
  inputFieldKey: number;
  isSearchActive: boolean;
}

class SearchBox extends Component<WrappedComponentProps, SearchBoxStates> {
  constructor(props: WrappedComponentProps) {
    super(props);

    reaction(
      () => TorrentFilterStore.filters.searchFilter,
      (searchFilter) => {
        if (searchFilter === '') {
          this.resetSearch();
        }
      },
    );

    this.state = {
      inputFieldKey: 0,
      isSearchActive: false,
    };
  }

  handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;
    this.setState({isSearchActive: value !== ''});
    UIActions.setTorrentsSearchFilter(value);
  };

  handleResetClick = () => {
    this.resetSearch();
    UIActions.setTorrentsSearchFilter('');
  };

  resetSearch = () => {
    this.setState((state) => ({
      inputFieldKey: state.inputFieldKey + 1,
      isSearchActive: false,
    }));
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

export default injectIntl(SearchBox);
