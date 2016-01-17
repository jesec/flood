import classnames from'classnames';
import React from'react';

import Search from '../icons/Search';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = [
  'handleKeyUp'
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

  handleKeyUp(event) {
    let value = event.target.value;
    this.setState({
      searchValue: value
    });
    UIActions.setTorrentsSearchFilter(value);
  }

  render() {
    let classSet = classnames({
      'sidebar__item': true,
      'sidebar__item--search': true,
      'is-in-use': this.state.searchValue !== ''
    });

    return (
      <div className={classSet}>
        <Search />
        <input className="textbox"
          type="text"
          placeholder="Search Torrents"
          onKeyUp={this.handleKeyUp} />
      </div>
    );
  }
}
