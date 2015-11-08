import classnames from 'classnames';
import React from 'react';

const methodsToBind = [
  'getContent',
  'handleDestinationChange',
  'handleUrlChange',
  'handleAddTorrent',
  'handleButtonClick'
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

  getContent() {
    return (
      <div className="modal__content" onClick={this.handleMenuWrapperClick}>
        <div className="modal__content__header">Add Torrent</div>
        <div className="modal__content__container">
          <div className="form__row">
            <label className="form__label">
              Torrents
            </label>
            <input className="textbox"
              onChange={this.handleUrlChange}
              placeholder="Torrent URLs"
              value={this.state.url}
              type="text" />
          </div>
          <div className="form__row">
            <label className="form__label">
              Destination
            </label>
            <input className="textbox"
              onChange={this.handleDestinationChange}
              placeholder="Destination"
              value={this.state.destination}
              type="text" />
          </div>
          <div className="form__row">
            <button className="button button--primary" onClick={this.handleAddTorrent}>Add Torrent</button>
          </div>
        </div>
      </div>
    );
  }

  handleAddTorrent() {
    // TorrentActions.add({
    //   url: this.state.url,
    //   destination: this.state.destination
    // });
  }

  handleButtonClick(evt) {
    evt.stopPropagation();
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  handleDestinationChange(event) {
    this.setState({
      destination: event.target.value
    })
  }

  handleMenuWrapperClick(evt) {
    evt.stopPropagation();
  }

  handleUrlChange(event) {
    this.setState({
      url: event.target.value
    })
  }

  render() {
    return this.getContent();
  }

}
