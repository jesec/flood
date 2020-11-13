import {Component} from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';

import {Checkbox, Form, FormRow} from '../../../ui';
import Modal from '../Modal';
import {saveDeleteTorrentsUserPreferences} from '../../../util/userPreferences';
import SettingStore from '../../../stores/SettingStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

import type {ModalAction} from '../../../stores/UIStore';

class RemoveTorrentsModal extends Component<WrappedComponentProps> {
  formRef?: Form | null;

  getActions(torrentCount: number): Array<ModalAction> {
    if (torrentCount === 0) {
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
        clickHandler: null,
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

  getContent(torrentCount: number) {
    let modalContent = null;
    let deleteDataContent = null;

    if (torrentCount === 0) {
      modalContent = <FormattedMessage id="torrents.remove.error.no.torrents.selected" />;
    } else {
      modalContent = <FormattedMessage id="torrents.remove.are.you.sure" values={{count: torrentCount}} />;

      deleteDataContent = (
        <FormRow>
          <Checkbox id="deleteData" checked={SettingStore.floodSettings.deleteTorrentData}>
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
    let deleteData = false;
    if (this.formRef != null && this.formRef.getFormData().deleteData) {
      deleteData = true;
    }

    TorrentActions.deleteTorrents({
      hashes: TorrentStore.selectedTorrents,
      deleteData,
    });

    saveDeleteTorrentsUserPreferences({deleteData});
  };

  render() {
    const {selectedTorrents} = TorrentStore;
    const modalHeading = this.props.intl.formatMessage({
      id: 'torrents.remove',
    });

    return (
      <Modal
        actions={this.getActions(selectedTorrents.length)}
        content={this.getContent(selectedTorrents.length)}
        heading={modalHeading}
      />
    );
  }
}

export default injectIntl(RemoveTorrentsModal);
