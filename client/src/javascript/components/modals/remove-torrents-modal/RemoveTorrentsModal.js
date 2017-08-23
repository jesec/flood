import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import Checkbox from '../../general/form-elements/Checkbox';
import Modal from '../Modal';
import SettingsStore from '../../../stores/SettingsStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

const METHODS_TO_BIND = [
  'handleRemovalConfirmation',
  'handleCheckboxChange'
];

class RemoveTorrentsModal extends React.Component {
  constructor() {
    super();

    this.state = {
      deleteData: SettingsStore.getFloodSettings('deleteTorrentData')
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getActions(torrents) {
    if (torrents.length === 0) {
      return [
        {
          clickHandler: null,
          content: 'OK',
          triggerDismiss: true,
          type: 'primary'
        }
      ];
    }

    return [
      {
        clickHandler: this.handleRemoveTorrentDecline,
        content: this.props.intl.formatMessage({
          id: 'button.no',
          defaultMessage: 'No'
        }),
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.handleRemovalConfirmation.bind(this, torrents),
        content: this.props.intl.formatMessage({
          id: 'button.yes',
          defaultMessage: 'Yes'
        }),
        triggerDismiss: true,
        type: 'primary'
      }
    ];
  }

  getContent(torrents) {
    let modalContent = null;
    let deleteDataContent = null;
    let selectedTorrentCount = torrents.length;

    if (selectedTorrentCount === 0) {
      modalContent = this.props.intl.formatMessage({
        id: 'torrents.remove.error.no.torrents.selected',
        defaultMessage: 'You haven\'t selected any torrents.'
      });
    } else {
      modalContent = this.props.intl.formatMessage({
        id: 'torrents.remove.are.you.sure',
        defaultMessage: `Are you sure you want to remove {count, plural,
          =0 {no torrents}
          =1 {one torrent}
          other {# torrents}
        }?`
      }, {
        count: selectedTorrentCount
      });

      deleteDataContent = (
        <div className="form__row">
          <div className="form__column">
            <Checkbox onChange={this.handleCheckboxChange}
              checked={this.state.deleteData}>
                <FormattedMessage
                  defaultMessage="Delete data"
                  id="torrents.remove.delete.data"
                  />
              </Checkbox>
          </div>
        </div>
      );
    }

    return (
      <div className="form modal__content">
        <div className="form__row">
          <div className="form__column">
            {modalContent}
          </div>
        </div>
        {deleteDataContent}
      </div>
    );
  }

  handleCheckboxChange(checkboxState) {
    this.setState({deleteData: checkboxState});
  }

  handleRemovalConfirmation(torrents) {
    TorrentActions.deleteTorrents(torrents, this.state.deleteData);
  }

  render() {
    let selectedTorrents = TorrentStore.getSelectedTorrents() || [];
    let modalHeading = this.props.intl.formatMessage({
      id: 'torrents.remove',
      defaultMessage: 'Remove Torrents'
    });

    return (
      <Modal actions={this.getActions(selectedTorrents)}
        alignment="center"
        content={this.getContent(selectedTorrents)}
        dismiss={this.props.dismiss}
        heading={modalHeading} />
    );
  }
}

export default injectIntl(RemoveTorrentsModal);
