import _ from 'underscore';
import classnames from 'classnames';
import React from 'react';

import { addTorrents } from '../../actions/ClientActions';
import TextboxRepeater from '../forms/TextboxRepeater';

const methodsToBind = [
  'getContent',
  'handleDestinationChange',
  'handleUrlAdd',
  'handleUrlChange',
  'handleUrlRemove',
  'handleAddTorrents'
];

export default class AddTorrents extends React.Component {

  constructor() {
    super();

    this.state = {
      destination: null,
      isExpanded: false,
      urlTextboxes: [
        {
          value: null
        }
      ]
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getContent() {
    return (
      <div className="modal__content" onClick={this.handleMenuWrapperClick}>
        <div className="modal__header">Add Torrents</div>
        <div className="modal__content__container">
          <div className="form__row">
            <TextboxRepeater placeholder="Torrent URL"
              handleTextboxAdd={this.handleUrlAdd}
              handleTextboxChange={this.handleUrlChange}
              handleTextboxRemove={this.handleUrlRemove}
              textboxes={this.state.urlTextboxes} />
          </div>
          <div className="form__row">
            <input className="textbox"
              onChange={this.handleDestinationChange}
              placeholder="Destination"
              value={this.state.destination}
              type="text" />
          </div>
          <div className="modal__button-group form__row">
            <button className="button button--deemphasize"
              onClick={this.props.dismissModal}>Cancel</button>
            <button className="button button--primary"
              onClick={this.handleAddTorrents}>Add Torrent</button>
          </div>
        </div>
      </div>
    );
  }

  handleAddTorrents() {
    let torrentUrls = _.pluck(this.state.urlTextboxes, 'value');
    this.props.dispatch(
      addTorrents(torrentUrls, this.state.destination)
    );
  }

  handleDestinationChange(event) {
    this.setState({
      destination: event.target.value
    })
  }

  handleMenuWrapperClick(event) {
    event.stopPropagation();
  }

  handleUrlRemove(index) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes.splice(index, 1);
    this.setState({
      urlTextboxes
    });
  }

  handleUrlAdd(index) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes.splice(index + 1, 0, {
      value: null
    });
    this.setState({
      urlTextboxes
    });
  }

  handleUrlChange(index, value) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes[index].value = value;
    this.setState({
      urlTextboxes
    });
  }

  render() {
    return this.getContent();
  }

}
