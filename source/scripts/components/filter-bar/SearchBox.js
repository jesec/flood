import classnames from'classnames';
import React from'react';

import Icon from'../icons/Icon';

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
    this.props.handleSearchChange({
      searchString: value
    });
  }

  render() {
    let classSet = classnames({
      'filter-bar__item': true,
      'filter-bar__item--search': true,
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
