import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Form, FormRow} from '../../../ui';

import AddTorrentsActions from './AddTorrentsActions';

import SettingsStore from '../../../stores/SettingsStore';
import TagSelect from '../../general/form-elements/TagSelect';
import TextboxRepeater from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';

type AddTorrentsByURLFormData = {
  [urls: string]: string;
} & {
  destination: string;
  isBasePath: boolean;
  start: boolean;
  tags: string;
};

interface AddTorrentsByURLProps extends WrappedComponentProps {
  initialURLs?: Array<{id: number; value: string}>;
}

interface AddTorrentsByURLStates {
  isAddingTorrents: boolean;
  urlTextboxes: Array<{id: number; value: string}>;
}

class AddTorrentsByURL extends React.Component<AddTorrentsByURLProps, AddTorrentsByURLStates> {
  formRef: Form | null = null;

  constructor(props: AddTorrentsByURLProps) {
    super(props);

    this.state = {
      isAddingTorrents: false,
      urlTextboxes: this.props.initialURLs || [{id: 0, value: ''}],
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
      isBasePath: formData.isBasePath || false,
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
          <TagSelect
            id="tags"
            label={this.props.intl.formatMessage({
              id: 'torrents.add.tags',
            })}
          />
        </FormRow>
        <AddTorrentsActions
          onAddTorrentsClick={this.handleAddTorrents}
          isAddingTorrents={this.state.isAddingTorrents}
        />
      </Form>
    );
  }
}

export default injectIntl(AddTorrentsByURL, {forwardRef: true});
