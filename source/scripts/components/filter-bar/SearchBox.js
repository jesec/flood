import classnames from'classnames';
import React from'react';

import Icon from'../icons/Icon';

const methodsToBind = [
  '_handleKeyUp'
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

  render() {
    let classSet = classnames({
      'filter-bar__item': true,
      'filter-bar__item--search': true,
      'is-in-use': this.state.searchValue !== ''
    });

    return (
      <div className={classSet}>
        <Icon icon="search" />
        <input className="textbox" type="text" placeholder="Search Torrents" onKeyUp={this._handleKeyUp} />
      </div>
    );
  }

  _handleKeyUp(event) {
    let value = event.target.value;
    this.setState({
      searchValue: value
    });
    this.props.searchChangeHandler(value);
  }

}
