import {Checkbox, Form, FormRow} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import Modal from '../Modal';
import SettingsStore from '../../../stores/SettingsStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

class RemoveTorrentsModal extends React.Component {
  getActions(torrents) {
    if (torrents.length === 0) {
      return [
        {
          clickHandler: null,
          content: 'OK',
          triggerDismiss: true,
          type: 'primary',
        },
      ];
    }

    return [
      {
        clickHandler: this.handleRemoveTorrentDecline,
        content: this.props.intl.formatMessage({
          id: 'button.no',
          defaultMessage: 'No',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        clickHandler: this.handleRemovalConfirmation,
        content: this.props.intl.formatMessage({
          id: 'button.yes',
          defaultMessage: 'Yes',
        }),
        triggerDismiss: true,
        type: 'primary',
      },
    ];
  }

  getContent(torrents) {
    let modalContent = null;
    let deleteDataContent = null;
    let selectedTorrentCount = torrents.length;

    if (selectedTorrentCount === 0) {
      modalContent = (
        <FormattedMessage
          id="torrents.remove.error.no.torrents.selected"
          defaultMessage="You haven't selected any torrents."
        />
      );
    } else {
      modalContent = (
        <FormattedMessage
          id="torrents.remove.are.you.sure"
          defaultMessage="Are you sure you want to remove {count, plural,
            =0 {no torrents}
            =1 {one torrent}
            other {# torrents}
          }?"
          values={{count: selectedTorrentCount}}
        />
      );

      deleteDataContent = (
        <FormRow>
          <Checkbox id="deleteData" checked={SettingsStore.getFloodSettings('deleteTorrentData')}>
            <FormattedMessage defaultMessage="Delete data" id="torrents.remove.delete.data" />
          </Checkbox>
        </FormRow>
      );
    }

    return (
      <div className="modal__content inverse">
        <Form ref={ref => (this.formRef = ref)}>
          <FormRow>{modalContent}</FormRow>
          {deleteDataContent}
        </Form>
      </div>
    );
  }

  handleRemovalConfirmation = () => {
    const torrents = TorrentStore.getSelectedTorrents();
    const formData = this.formRef.getFormData();
    TorrentActions.deleteTorrents(torrents, formData.deleteData);
  };

  render() {
    let selectedTorrents = TorrentStore.getSelectedTorrents();
    let modalHeading = this.props.intl.formatMessage({
      id: 'torrents.remove',
      defaultMessage: 'Remove Torrents',
    });

    return (
      <Modal
        actions={this.getActions(selectedTorrents)}
        alignment="center"
        content={this.getContent(selectedTorrents)}
        dismiss={this.props.dismiss}
        heading={modalHeading}
      />
    );
  }
}

export default injectIntl(RemoveTorrentsModal);
