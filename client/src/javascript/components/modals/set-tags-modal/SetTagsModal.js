import {Form, FormRow, Textbox} from 'flood-ui-kit';
import {injectIntl} from 'react-intl';
import React from 'react';

import Modal from '../Modal';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

class SetTagsModal extends React.Component {
  formRef = null;

  state = {
    isSettingTags: false,
    tags: '',
  };

  handleSetTagsClick = () => {
    const formData = this.formRef.getFormData();
    const tags = formData.tags ? formData.tags.split(',') : [];

    this.setState({isSettingTags: true}, () => TorrentActions.setTaxonomy(TorrentStore.getSelectedTorrents(), tags));
  };

  getActions() {
    let primaryButtonText = this.props.intl.formatMessage({
      id: 'torrents.set.tags.button.set',
      defaultMessage: 'Set Tags',
    });

    return [
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
          defaultMessage: 'Cancel',
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
        <Form ref={ref => (this.formRef = ref)}>
          <FormRow>
            <Textbox
              defaultValue={tagsValue}
              id="tags"
              placeholder={this.props.intl.formatMessage({
                id: 'torrents.set.tags.enter.tags',
                defaultMessage: 'Enter tags',
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
        dismiss={this.props.dismiss}
        heading={this.props.intl.formatMessage({
          id: 'torrents.set.tags.heading',
          defaultMessage: 'Set Tags',
        })}
      />
    );
  }
}

export default injectIntl(SetTagsModal);
