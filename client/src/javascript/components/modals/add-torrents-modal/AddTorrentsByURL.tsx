import {Component} from 'react';
import {injectIntl, WrappedComponentProps} from 'react-intl';

import AddTorrentsActions from './AddTorrentsActions';
import FilesystemBrowserTextbox from '../../general/filesystem/FilesystemBrowserTextbox';
import {Form, FormRow} from '../../../ui';
import {saveAddTorrentsUserPreferences} from '../../../util/userPreferences';
import TagSelect from '../../general/form-elements/TagSelect';
import TextboxRepeater, {getTextArray} from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

type AddTorrentsByURLFormData = {
  [urls: string]: string;
} & {
  [cookies: string]: string;
} & {
  destination: string;
  isBasePath: boolean;
  isCompleted: boolean;
  start: boolean;
  tags: string;
};

interface AddTorrentsByURLStates {
  isAddingTorrents: boolean;
  urlTextboxes: Array<{id: number; value: string}>;
}

class AddTorrentsByURL extends Component<WrappedComponentProps, AddTorrentsByURLStates> {
  formRef: Form | null = null;

  constructor(props: WrappedComponentProps) {
    super(props);

    this.state = {
      isAddingTorrents: false,
      urlTextboxes: (UIStore.activeModal?.id === 'add-torrents' && UIStore.activeModal?.initialURLs) || [
        {id: 0, value: ''},
      ],
    };
  }

  handleAddTorrents = () => {
    if (this.formRef == null) {
      return;
    }

    const formData = this.formRef.getFormData() as Partial<AddTorrentsByURLFormData>;
    this.setState({isAddingTorrents: true});

    const urls = getTextArray(formData, 'urls').filter((url) => url !== '');

    if (urls.length === 0 || formData.destination == null) {
      this.setState({isAddingTorrents: false});
      return;
    }

    const cookies = getTextArray(formData, 'cookies');

    // TODO: handle multiple domain names
    const firstDomain = urls[0].startsWith('http') && urls[0].split('/')[2];
    const processedCookies = firstDomain
      ? {
          [firstDomain]: cookies,
        }
      : undefined;

    TorrentActions.addTorrentsByUrls({
      urls,
      cookies: processedCookies,
      destination: formData.destination,
      isBasePath: formData.isBasePath,
      isCompleted: formData.isCompleted,
      start: formData.start,
      tags: formData.tags != null ? formData.tags.split(',') : undefined,
    }).then(() => {
      UIStore.dismissModal();
    });

    saveAddTorrentsUserPreferences({start: formData.start, destination: formData.destination});
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
        <TextboxRepeater
          id="cookies"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.cookies.label',
          })}
          placeholder={this.props.intl.formatMessage({
            id: 'torrents.add.cookies.input.placeholder',
          })}
        />
        <FilesystemBrowserTextbox
          id="destination"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.destination.label',
          })}
          selectable="directories"
          showBasePathToggle
          showCompletedToggle
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
