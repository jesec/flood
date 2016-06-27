import classnames from'classnames';
import React from'react';

import Close from '../../Icons/Close';
import Search from '../../Icons/Search';
import UIActions from '../../../actions/UIActions';

const METHODS_TO_BIND = [
  'handleSearchChange',
  'resetSearch'
];

export default class SearchBox extends React.Component {
  constructor() {
    super();

    this.state = {
      searchValue: ''
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleSearchChange(event) {
    let searchValue = event.target.value;
    this.setState({searchValue});
    UIActions.setTorrentsSearchFilter(searchValue);
  }

  isSearchActive() {
    return this.state.searchValue !== '';
  }

  resetSearch() {
    this.setState({searchValue: ''});
    UIActions.setTorrentsSearchFilter('');
  }

  render() {
    let clearSearchButton = null;
    let classes = classnames({
      'sidebar__item': true,
      'search': true,
      'is-in-use': this.isSearchActive()
    });

    if (this.isSearchActive()) {
      clearSearchButton = (
        <div className="button search__reset-button" onClick={this.resetSearch}>
          <Close />
        </div>
      );
    }

    return (
      <div className={classes}>
        {clearSearchButton}
        <Search />
        <input className="textbox"
          type="text"
          placeholder="Search Torrents"
          onChange={this.handleSearchChange}
          value={this.state.searchValue} />
      </div>
    );
  }
}
