import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Checkbox, Form, FormRow, Textbox} from '../../../ui';

import AddTorrentsActions from './AddTorrentsActions';

import SettingsStore from '../../../stores/SettingsStore';
import TagSelect from '../../general/form-elements/TagSelect';
import TextboxRepeater, {getTextArray} from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import FilesystemBrowserTextbox from '../../general/filesystem/FilesystemBrowserTextbox';

type AddTorrentsByCreationFormData = {
  [trackers: string]: string;
} & {
  name: string;
  sourcePath: string;
  comment: string;
  infoSource: string;
  isPrivate: boolean;
  start: boolean;
  tags: string;
};

interface AddTorrentsByCreationStates {
  isCreatingTorrents: boolean;
  trackerTextboxes: Array<{id: number; value: string}>;
}

class AddTorrentsByCreation extends React.Component<WrappedComponentProps, AddTorrentsByCreationStates> {
  formRef: Form | null = null;

  constructor(props: WrappedComponentProps) {
    super(props);

    this.state = {
      isCreatingTorrents: false,
      trackerTextboxes: [{id: 0, value: ''}],
    };
  }

  handleAddTorrents = () => {
    if (this.formRef == null) {
      return;
    }

    const formData = this.formRef.getFormData() as Partial<AddTorrentsByCreationFormData>;
    this.setState({isCreatingTorrents: true});

    if (formData.sourcePath == null) {
      return;
    }

    TorrentActions.createTorrent({
      name: formData.name,
      sourcePath: formData.sourcePath,
      trackers: getTextArray(formData, 'trackers'),
      comment: formData.comment,
      infoSource: formData.infoSource,
      isPrivate: formData.isPrivate || false,
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
        <FilesystemBrowserTextbox
          id="sourcePath"
          label={this.props.intl.formatMessage({
            id: 'torrents.create.source.path.label',
          })}
        />
        <TextboxRepeater
          id="trackers"
          label={this.props.intl.formatMessage({
            id: 'torrents.create.trackers.label',
          })}
          placeholder={this.props.intl.formatMessage({
            id: 'torrents.create.tracker.input.placeholder',
          })}
          defaultValues={this.state.trackerTextboxes}
        />
        <FormRow>
          <Textbox
            id="name"
            label={this.props.intl.formatMessage({
              id: 'torrents.create.base.name.label',
            })}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.create.base.name.input.placeholder',
            })}
          />
        </FormRow>
        <FormRow>
          <Textbox
            id="comment"
            label={this.props.intl.formatMessage({
              id: 'torrents.create.comment.label',
            })}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.create.comment.input.placeholder',
            })}
          />
        </FormRow>
        <FormRow>
          <Textbox
            id="infoSource"
            label={this.props.intl.formatMessage({
              id: 'torrents.create.info.source.label',
            })}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.create.info.source.input.placeholder',
            })}
          />
        </FormRow>
        <FormRow>
          <Checkbox grow={false} id="isPrivate">
            {this.props.intl.formatMessage({id: 'torrents.create.is.private.label'})}
          </Checkbox>
        </FormRow>
        <FormRow>
          <TagSelect
            id="tags"
            label={this.props.intl.formatMessage({
              id: 'torrents.add.tags',
            })}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.create.tags.input.placeholder',
            })}
          />
        </FormRow>
        <AddTorrentsActions
          onAddTorrentsClick={this.handleAddTorrents}
          isAddingTorrents={this.state.isCreatingTorrents}
        />
      </Form>
    );
  }
}

export default injectIntl(AddTorrentsByCreation, {forwardRef: true});
