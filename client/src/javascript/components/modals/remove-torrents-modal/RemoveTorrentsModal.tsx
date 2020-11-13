import {Component} from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';

import {Form, FormRow} from '../../../ui';
import Modal from '../Modal';
import {saveDeleteTorrentsUserPreferences} from '../../../util/userPreferences';
import SettingStore from '../../../stores/SettingStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

import type {ModalAction} from '../../../stores/UIStore';

class RemoveTorrentsModal extends Component<WrappedComponentProps> {
  formRef?: Form | null;

  getActions(torrentCount: number): Array<ModalAction> {
    const {intl} = this.props;

    return torrentCount === 0
      ? [
          {
            clickHandler: null,
            content: intl.formatMessage({
              id: 'button.ok',
            }),
            triggerDismiss: true,
            type: 'primary',
          },
        ]
      : [
          {
            checked: SettingStore.floodSettings.deleteTorrentData,
            content: intl.formatMessage({
              id: 'torrents.remove.delete.data',
            }),
            id: 'deleteData',
            type: 'checkbox',
          },
          {
            clickHandler: null,
            content: intl.formatMessage({
              id: 'button.no',
            }),
            triggerDismiss: true,
            type: 'tertiary',
          },
          {
            clickHandler: this.handleRemovalConfirmation,
            content: intl.formatMessage({
              id: 'button.yes',
            }),
            triggerDismiss: true,
            type: 'primary',
          },
        ];
  }

  getContent(torrentCount: number) {
    return (
      <div className="modal__content inverse">
        <Form
          ref={(ref) => {
            this.formRef = ref;
          }}>
          <FormRow>
            {torrentCount === 0 ? (
              <FormattedMessage id="torrents.remove.error.no.torrents.selected" />
            ) : (
              <FormattedMessage id="torrents.remove.are.you.sure" values={{count: torrentCount}} />
            )}
          </FormRow>
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
