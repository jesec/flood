import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Form, FormRow} from '../../../ui';
import Modal from '../Modal';
import TagSelect from '../../general/form-elements/TagSelect';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

import type {ModalAction} from '../../../stores/UIStore';

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

  getActions(): Array<ModalAction> {
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
    return (
      <div className="modal__content inverse">
        <Form
          ref={(ref) => {
            this.formRef = ref;
          }}>
          <FormRow>
            <TagSelect
              defaultValue={TorrentStore.selectedTorrents.map((hash: string) => TorrentStore.torrents[hash].tags)[0]}
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

  handleSetTagsClick = () => {
    if (this.formRef == null) {
      return;
    }

    const formData = this.formRef.getFormData() as {tags: string};
    const tags = formData.tags ? formData.tags.split(',') : [];

    this.setState({isSettingTags: true}, () => TorrentActions.setTags({hashes: TorrentStore.selectedTorrents, tags}));
  };

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
