import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';
import {Checkbox, Form, FormRow, Textbox} from '../../../ui';
import {saveAddTorrentsUserPreferences} from '../../../util/userPreferences';
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

    saveAddTorrentsUserPreferences({start: formData.start, destination: formData.sourcePath});
  };

  render() {
    const {intl} = this.props;
    const {isCreatingTorrents, trackerTextboxes} = this.state;

    return (
      <Form
        className="inverse"
        ref={(ref) => {
          this.formRef = ref;
        }}>
        <FilesystemBrowserTextbox
          id="sourcePath"
          label={intl.formatMessage({
            id: 'torrents.create.source.path.label',
          })}
        />
        <TextboxRepeater
          id="trackers"
          label={intl.formatMessage({
            id: 'torrents.create.trackers.label',
          })}
          placeholder={intl.formatMessage({
            id: 'torrents.create.tracker.input.placeholder',
          })}
          defaultValues={trackerTextboxes}
        />
        <FormRow>
          <Textbox
            id="name"
            label={intl.formatMessage({
              id: 'torrents.create.base.name.label',
            })}
            placeholder={intl.formatMessage({
              id: 'torrents.create.base.name.input.placeholder',
            })}
          />
        </FormRow>
        <FormRow>
          <Textbox
            id="comment"
            label={intl.formatMessage({
              id: 'torrents.create.comment.label',
            })}
            placeholder={intl.formatMessage({
              id: 'torrents.create.comment.input.placeholder',
            })}
          />
        </FormRow>
        <FormRow>
          <Textbox
            id="infoSource"
            label={intl.formatMessage({
              id: 'torrents.create.info.source.label',
            })}
            placeholder={intl.formatMessage({
              id: 'torrents.create.info.source.input.placeholder',
            })}
          />
        </FormRow>
        <FormRow>
          <Checkbox grow={false} id="isPrivate">
            {intl.formatMessage({id: 'torrents.create.is.private.label'})}
          </Checkbox>
        </FormRow>
        <FormRow>
          <TagSelect
            id="tags"
            label={intl.formatMessage({
              id: 'torrents.add.tags',
            })}
            placeholder={intl.formatMessage({
              id: 'torrents.create.tags.input.placeholder',
            })}
          />
        </FormRow>
        <AddTorrentsActions onAddTorrentsClick={this.handleAddTorrents} isAddingTorrents={isCreatingTorrents} />
      </Form>
    );
  }
}

export default injectIntl(AddTorrentsByCreation, {forwardRef: true});
