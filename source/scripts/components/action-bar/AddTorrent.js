import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import Action from './Action';
import TorrentActions from '../../actions/TorrentActions';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
  'getChildren',
  '_handleDestinationChange',
  '_handleUrlChange',
  '_handleAddTorrent',
  '_handleButtonClick',
  '_handleExternalClick',
  '_handleExternalClick'
];

export default class AddTorrentPanel extends React.Component {

  constructor() {
    super();

    this.state = {
      isExpanded: false
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    window.addEventListener('click', this._handleExternalClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleExternalClick);
  }

  getChildren() {
    return (
      <div className="dropdown__content" onClick={this._handleMenuWrapperClick}>
        <div className="dropdown__content__header">Add Torrent</div>
        <div className="dropdown__content__container">
          <div className="form__row">
            <label className="form__label">
              Torrents
            </label>
            <input className="textbox"
              onChange={this._handleUrlChange}
              placeholder="Torrent URLs"
              value={this.state.url}
              type="text" />
          </div>
          <div className="form__row">
            <label className="form__label">
              Destination
            </label>
            <input className="textbox"
              onChange={this._handleDestinationChange}
              placeholder="Destination"
              value={this.state.destination}
              type="text" />
          </div>
          <div className="form__row">
            <button className="button button--primary" onClick={this._handleAddTorrent}>Add Torrent</button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    let classSet = classnames({
      'dropdown': true,
      'dropdown--align-right': true,
      'is-expanded': this.state.isExpanded
    });
    let children = null;

    if (this.state.isExpanded) {
      children = this.getChildren();
    }

    return (
      <div className={classSet}>
        <Action label="Add Torrent" slug="add-torrent" icon="add" clickHandler={this._handleButtonClick} />
        <CSSTransitionGroup
          transitionName="dropdown__content"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}>
          {children}
        </CSSTransitionGroup>
      </div>
    );
  }

  _handleDestinationChange(event) {
    this.setState({
      destination: event.target.value
    })
  }

  _handleUrlChange(event) {
    this.setState({
      url: event.target.value
    })
  }

  _handleAddTorrent() {
    TorrentActions.add({
      url: this.state.url,
      destination: this.state.destination
    });
  }

  _handleButtonClick(evt) {
    evt.stopPropagation();
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  _handleExternalClick() {
    if (this.state.isExpanded) {
      this.setState({
        isExpanded: false
      });
    }
  }

  _handleMenuWrapperClick(evt) {
    evt.stopPropagation();
  }

}
