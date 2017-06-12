import {defineMessages, formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';
import FormColumn from '../../general/form-elements/FormColumn';
import FormLabel from '../../general/form-elements/FormLabel';
import SettingsStore from '../../../stores/SettingsStore';
import TextboxRepeater from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import Validator from '../../../util/Validator';

const messages = defineMessages({
  mustSpecifyDestination: {
    id: 'torrents.add.tab.destination.empty',
    defaultMessage: 'You must specify a destination.'
  },
  mustSpecifyURLs: {
    id: 'torrents.add.tab.urls.empty',
    defaultMessage: 'You must specify at least one torrent.'
  }
});

const METHODS_TO_BIND = [
  'handleAddTorrents',
  'handleStartTorrentsToggle',
  'handleTagsChange',
  'handleUrlAdd',
  'handleUrlChange',
  'handleUrlRemove'
];

class AddTorrentsByURL extends React.Component {
  constructor(props) {
    super();

    this.state = {
      addTorrentsError: null,
      errors: {},
      isAddingTorrents: false,
      tags: '',
      urlTextboxes: [{value: ''}],
      startTorrents: SettingsStore.getFloodSettings('startTorrentsOnLoad')
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.validatedFields = {
      destination: {
        isValid: Validator.isNotEmpty,
        error: props.intl.formatMessage(messages.mustSpecifyDestination)
      },
      urls: {
        isValid: value => value !== '' && value != null,
        error: props.intl.formatMessage(messages.mustSpecifyURLs)
      }
    };
  }

  handleAddTorrents() {
    if (this.isFormValid()) {
      this.setState({isAddingTorrents: true});
      let torrentURLs = _.map(this.state.urlTextboxes, 'value');

      TorrentActions.addTorrentsByUrls({
        urls: torrentURLs,
        destination: this.torrentDestinationRef.getWrappedInstance().getDestination(),
        isBasePath: this.torrentDestinationRef.getWrappedInstance().isBasePath(),
        start: this.state.startTorrents,
        tags: this.state.tags.split(',')
      });
    }
  }

  handleStartTorrentsToggle(value) {
    this.setState({startTorrents: value});
  }

  handleTagsChange(event) {
    this.setState({tags: event.target.value});
  }

  handleUrlRemove(index) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes.splice(index, 1);
    this.setState({urlTextboxes});
  }

  handleUrlAdd(index) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes.splice(index + 1, 0, {value: ''});
    this.setState({urlTextboxes});
  }

  handleUrlChange(index, value) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes[index].value = value;
    this.setState({urlTextboxes});
  }

  isFormValid() {
    const areURLsDefined = this.state.urlTextboxes.some(({value}) => {
      return this.validatedFields.urls.isValid(value);
    });
    const isDestinationValid = this.validatedFields.destination
      .isValid(this.torrentDestinationRef.getWrappedInstance().getDestination());
    const nextErrorsState = {};

    if (!areURLsDefined) {
      nextErrorsState.urls = this.validatedFields.urls.error;
    }

    if (!isDestinationValid) {
      nextErrorsState.destination = this.validatedFields.destination.error;
    }

    if (!areURLsDefined || !isDestinationValid) {
      this.setState({errors: nextErrorsState});
    }

    return isDestinationValid && areURLsDefined;
  }

  render() {
    let error = null;

    if (this.state.addTorrentsError) {
      error = (
        <div className="form__row">
          <div className="form__column">
            {this.state.addTorrentsError}
          </div>
        </div>
      );
    }

    return (
      <div className="form">
        {error}
        <div className="form__row">
          <FormColumn error={this.state.errors.urls}>
            <FormLabel error={this.state.errors.urls}>
              <FormattedMessage
                id="torrents.add.torrents.label"
                defaultMessage="Torrents"
              />
            </FormLabel>
            <TextboxRepeater placeholder={this.props.intl.formatMessage({
                id: 'torrents.add.tab.url.input.placeholder',
                defaultMessage: 'Torrent URL or Magnet Link'
              })}
              handleTextboxAdd={this.handleUrlAdd}
              handleTextboxChange={this.handleUrlChange}
              handleTextboxRemove={this.handleUrlRemove}
              textboxes={this.state.urlTextboxes} />
          </FormColumn>
        </div>
        <div className="form__row">
          <FormColumn error={this.state.errors.destination}>
            <FormLabel error={this.state.errors.destination}>
              <FormattedMessage
                id="torrents.add.destination.label"
                defaultMessage="Destination"
              />
            </FormLabel>
            <TorrentDestination ref={ref => this.torrentDestinationRef = ref} />
          </FormColumn>
        </div>
        <div className="form__row">
          <FormColumn>
            <FormLabel>
              <FormattedMessage
                id="torrents.add.tags"
                defaultMessage="Tags"
              />
            </FormLabel>
            <input className="textbox"
              onChange={this.handleTagsChange}
              value={this.state.tags} />
          </FormColumn>
        </div>
        <AddTorrentsActions dismiss={this.props.dismissModal}
          onAddTorrentsClick={this.handleAddTorrents}
          onStartTorrentsToggle={this.handleStartTorrentsToggle}
          isAddingTorrents={this.state.isAddingTorrents} />
      </div>
    );
  }
}

export default injectIntl(AddTorrentsByURL, {withRef: true});
