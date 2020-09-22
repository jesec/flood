import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Form, FormRow, Textbox} from '../../../ui';

import AddTorrentsActions from './AddTorrentsActions';

import SettingsStore from '../../../stores/SettingsStore';
import TextboxRepeater from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import UIStore from '../../../stores/UIStore';

import type {Textboxes} from '../../general/form-elements/TextboxRepeater';

type AddTorrentsByURLFormData = {
  [urls: string]: string;
} & {
  destination: string;
  useBasePath: boolean;
  start: boolean;
  tags: string;
};

interface AddTorrentsByURLProps extends WrappedComponentProps {
  dismissModal: () => void;
}

interface AddTorrentsByURLStates {
  isAddingTorrents: boolean;
  tags: string;
  urlTextboxes: Textboxes;
}

class AddTorrentsByURL extends React.Component<AddTorrentsByURLProps, AddTorrentsByURLStates> {
  formRef: Form | null = null;

  constructor(props: AddTorrentsByURLProps) {
    super(props);

    const activeModal = UIStore.getActiveModal();
    const initialUrls = activeModal ? activeModal.torrents : null;

    this.state = {
      isAddingTorrents: false,
      tags: '',
      urlTextboxes: (initialUrls as Textboxes) || [{id: 0, value: ''}],
    };
  }

  getURLsFromForm() {
    if (this.formRef == null) {
      return [];
    }

    const formData = this.formRef.getFormData() as Partial<AddTorrentsByURLFormData>;
    return Object.keys(formData).reduce((accumulator: Array<string>, formItemKey: string) => {
      if (/^urls/.test(formItemKey)) {
        const url = formData[formItemKey];
        if (url != null) {
          accumulator.push(url);
        }
      }

      return accumulator;
    }, []);
  }

  handleAddTorrents = () => {
    if (this.formRef == null) {
      return;
    }

    const formData = this.formRef.getFormData() as Partial<AddTorrentsByURLFormData>;
    this.setState({isAddingTorrents: true});

    if (formData.destination == null) {
      return;
    }

    TorrentActions.addTorrentsByUrls({
      urls: this.getURLsFromForm(),
      destination: formData.destination,
      isBasePath: formData.useBasePath || false,
      start: formData.start || false,
      tags: formData.tags != null ? formData.tags.split(',') : undefined,
    });

    SettingsStore.setFloodSetting('startTorrentsOnLoad', Boolean(formData.start));
  };

  render() {
    return (
      <Form
        className="inverse"
        ref={(ref) => {
          this.formRef = ref;
        }}>
        <TextboxRepeater
          id="urls"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.torrents.label',
          })}
          placeholder={this.props.intl.formatMessage({
            id: 'torrents.add.tab.url.input.placeholder',
          })}
          defaultValues={this.state.urlTextboxes}
        />
        <TorrentDestination
          id="destination"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.destination.label',
          })}
        />
        <FormRow>
          <Textbox
            id="tags"
            defaultValue={this.state.tags}
            label={this.props.intl.formatMessage({
              id: 'torrents.add.tags',
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

export default injectIntl(AddTorrentsByURL, {forwardRef: true});
