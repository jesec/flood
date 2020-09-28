import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Form, FormRow, Textbox} from '../../../ui';
import Modal from '../Modal';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

interface SetTagsModalStates {
  isSettingTags: boolean;
}

class SetTagsModal extends React.Component<WrappedComponentProps, SetTagsModalStates> {
  formRef: Form | null = null;

  constructor(props: WrappedComponentProps) {
    super(props);
    this.state = {
      isSettingTags: false,
    };
  }

  handleSetTagsClick = () => {
    if (this.formRef == null) {
      return;
    }

    const formData = this.formRef.getFormData() as {tags: string};
    const tags = formData.tags ? formData.tags.split(',') : [];

    this.setState({isSettingTags: true}, () => TorrentActions.setTaxonomy(TorrentStore.getSelectedTorrents(), tags));
  };

  getActions(): Modal['props']['actions'] {
    const primaryButtonText = this.props.intl.formatMessage({
      id: 'torrents.set.tags.button.set',
    });

    return [
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        clickHandler: this.handleSetTagsClick,
        content: primaryButtonText,
        isLoading: this.state.isSettingTags,
        triggerDismiss: false,
        type: 'primary',
      },
    ];
  }

  getContent() {
    const tagsValue = TorrentStore.getSelectedTorrentsTags()[0].join(', ');

    return (
      <div className="modal__content inverse">
        <Form
          ref={(ref) => {
            this.formRef = ref;
          }}>
          <FormRow>
            <Textbox
              defaultValue={tagsValue}
              id="tags"
              placeholder={this.props.intl.formatMessage({
                id: 'torrents.set.tags.enter.tags',
              })}
            />
          </FormRow>
        </Form>
      </div>
    );
  }

  render() {
    return (
      <Modal
        actions={this.getActions()}
        content={this.getContent()}
        heading={this.props.intl.formatMessage({
          id: 'torrents.set.tags.heading',
        })}
      />
    );
  }
}

export default injectIntl(SetTagsModal);
