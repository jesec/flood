import classnames from'classnames';
import React from'react';

import Icon from '../icons/Icon';
import UIActions from '../../actions/UIActions';

const methodsToBind = [
  'handleKeyUp'
];

export default class SearchBox extends React.Component {
  constructor() {
    super();

    this.state = {
      searchValue: ''
    };

    methodsToBind.forEach((method) => {
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
        <Icon icon="search" />
        <input className="textbox"
          type="text"
          placeholder="Search Torrents"
          onKeyUp={this.handleKeyUp} />
      </div>
    );
  }
}
