import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import {Checkbox, Form, FormRow} from '../../../ui';
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
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        clickHandler: this.handleRemovalConfirmation,
        content: this.props.intl.formatMessage({
          id: 'button.yes',
        }),
        triggerDismiss: true,
        type: 'primary',
      },
    ];
  }

  getContent(torrents) {
    let modalContent = null;
    let deleteDataContent = null;
    const selectedTorrentCount = torrents.length;

    if (selectedTorrentCount === 0) {
      modalContent = <FormattedMessage id="torrents.remove.error.no.torrents.selected" />;
    } else {
      modalContent = <FormattedMessage id="torrents.remove.are.you.sure" values={{count: selectedTorrentCount}} />;

      deleteDataContent = (
        <FormRow>
          <Checkbox id="deleteData" checked={SettingsStore.getFloodSetting('deleteTorrentData')}>
            <FormattedMessage id="torrents.remove.delete.data" />
          </Checkbox>
        </FormRow>
      );
    }

    return (
      <div className="modal__content inverse">
        <Form
          ref={(ref) => {
            this.formRef = ref;
          }}>
          <FormRow>{modalContent}</FormRow>
          {deleteDataContent}
        </Form>
      </div>
    );
  }

  handleRemovalConfirmation = () => {
    TorrentActions.deleteTorrents({
      hashes: TorrentStore.getSelectedTorrents(),
      deleteData: this.formRef.getFormData().deleteData,
    });
  };

  render() {
    const selectedTorrents = TorrentStore.getSelectedTorrents();
    const modalHeading = this.props.intl.formatMessage({
      id: 'torrents.remove',
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
