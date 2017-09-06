import {Form, FormRow, Textbox} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';

import ModalFormSectionHeader from '../../modals/ModalFormSectionHeader';
import SettingsStore from '../../../stores/SettingsStore';
import TextboxRepeater from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';

class AddTorrentsByURL extends React.Component {
  _formData = {};
  _formRef = null;

  state = {
    errors: {},
    isAddingTorrents: false,
    tags: '',
    urlTextboxes: [{value: ''}],
    startTorrents: SettingsStore.getFloodSettings('startTorrentsOnLoad')
  };

  getURLsFromForm() {
    return Object.keys(this._formData).reduce(
      (accumulator, formItemKey) => {
        if (/^urls/.test(formItemKey)) {
          accumulator.push(this._formData[formItemKey]);
        }

        return accumulator;
      },
      []
    );
  }

  handleAddTorrents = () => {
    const formData = this._formRef.getFormData();
    this.setState({isAddingTorrents: true});

    TorrentActions.addTorrentsByUrls({
      urls: this.getURLsFromForm(),
      destination: formData.destination,
      isBasePath: formData.useBasePath,
      start: formData.start,
      tags: formData.tags.split(',')
    });

    SettingsStore.updateOptimisticallyOnly({
      id: 'startTorrentsOnLoad',
      data: formData.start
    });
  };

  handleFormChange = ({event, formData}) => {
    this._formData = formData;
  };

  render() {
    return (
      <Form className="inverse" onChange={this.handleFormChange} ref={ref => this._formRef = ref}>
        <ModalFormSectionHeader>
          <FormattedMessage
            id="torrents.add.torrents.label"
            defaultMessage="Torrents"
          />
        </ModalFormSectionHeader>
        <TextboxRepeater
          id="urls"
          placeholder={this.props.intl.formatMessage({
            id: 'torrents.add.tab.url.input.placeholder',
            defaultMessage: 'Torrent URL or Magnet Link'
          })}
        />
        <ModalFormSectionHeader>
          <FormattedMessage
            id="torrents.add.destination.label"
            defaultMessage="Destination"
          />
        </ModalFormSectionHeader>
        <TorrentDestination
          id="destination"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.destination.label',
            defaultMessage: 'Destination'
          })}
        />
        <ModalFormSectionHeader>
          <FormattedMessage
            id="torrents.add.tags"
            defaultMessage="Tags"
          />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox id="tags" defaultValue={this.state.tags} />
        </FormRow>
        <AddTorrentsActions
          dismiss={this.props.dismissModal}
          onAddTorrentsClick={this.handleAddTorrents}
          isAddingTorrents={this.state.isAddingTorrents}
        />
      </Form>
    );
  }
}

export default injectIntl(AddTorrentsByURL, {withRef: true});
