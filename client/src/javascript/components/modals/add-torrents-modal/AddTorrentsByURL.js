import {Form, FormRow, Textbox} from 'flood-ui-kit';
import {injectIntl} from 'react-intl';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';

import SettingsStore from '../../../stores/SettingsStore';
import TextboxRepeater from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import UIStore from '../../../stores/UIStore';

class AddTorrentsByURL extends React.Component {
  _formData = {};
  _formRef = null;

  constructor() {
    super();

    const activeModal = UIStore.getActiveModal();
    const initialUrls = activeModal ? activeModal.torrents : null;

    this.state = {
      errors: {},
      isAddingTorrents: false,
      tags: '',
      urlTextboxes: initialUrls || [{id: 0, value: ''}],
      startTorrents: SettingsStore.getFloodSettings('startTorrentsOnLoad'),
    };
  }

  getURLsFromForm() {
    const formData = this._formRef.getFormData();
    return Object.keys(formData).reduce((accumulator, formItemKey) => {
      if (/^urls/.test(formItemKey)) {
        accumulator.push(formData[formItemKey]);
      }

      return accumulator;
    }, []);
  }

  handleAddTorrents = () => {
    const formData = this._formRef.getFormData();
    this.setState({isAddingTorrents: true});

    TorrentActions.addTorrentsByUrls({
      urls: this.getURLsFromForm(),
      destination: formData.destination,
      isBasePath: formData.useBasePath,
      start: formData.start,
      tags: formData.tags.split(','),
    });

    SettingsStore.updateOptimisticallyOnly({
      id: 'startTorrentsOnLoad',
      data: formData.start,
    });
  };

  handleFormChange = ({event, formData}) => {
    this._formData = formData;
  };

  render() {
    return (
      <Form className="inverse" onChange={this.handleFormChange} ref={ref => (this._formRef = ref)}>
        <TextboxRepeater
          id="urls"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.torrents.label',
            defaultMessage: 'Torrents',
          })}
          placeholder={this.props.intl.formatMessage({
            id: 'torrents.add.tab.url.input.placeholder',
            defaultMessage: 'Torrent URL or Magnet Link',
          })}
          defaultValues={this.state.urlTextboxes}
        />
        <TorrentDestination
          id="destination"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.destination.label',
            defaultMessage: 'Destination',
          })}
        />
        <FormRow>
          <Textbox
            id="tags"
            defaultValue={this.state.tags}
            label={this.props.intl.formatMessage({
              id: 'torrents.add.tags',
              defaultMessage: 'Tags',
            })}
          />
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
