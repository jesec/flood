import {FC, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {Form, FormRow} from '@client/ui';
import {saveDeleteTorrentsUserPreferences} from '@client/util/userPreferences';
import SettingStore from '@client/stores/SettingStore';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import Modal from '../Modal';
import ModalActions from '../ModalActions';

const RemoveTorrentsModal: FC = () => {
  const intl = useIntl();
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const {selectedTorrents} = TorrentStore;

  if (selectedTorrents.length === 0) {
    return (
      <Modal
        heading={intl.formatMessage({
          id: 'torrents.remove',
        })}
        content={
          <div className="modal__content inverse">
            <Form>
              <FormRow>
                <FormattedMessage id="torrents.remove.error.no.torrents.selected" />
              </FormRow>
            </Form>
          </div>
        }
        actions={[
          {
            clickHandler: null,
            content: intl.formatMessage({
              id: 'button.ok',
            }),
            triggerDismiss: true,
            type: 'primary',
          },
        ]}
      />
    );
  }

  return (
    <Modal
      heading={intl.formatMessage({
        id: 'torrents.remove',
      })}
      content={
        <div className="modal__content">
          <Form
            className="inverse"
            onSubmit={({formData}) => {
              setIsRemoving(true);

              const deleteData = formData.deleteData as boolean;

              TorrentActions.deleteTorrents({
                hashes: TorrentStore.selectedTorrents,
                deleteData,
              }).then(() => {
                setIsRemoving(false);
                saveDeleteTorrentsUserPreferences({deleteData});
                UIStore.dismissModal();
              });
            }}>
            <FormRow>
              <FormattedMessage id="torrents.remove.are.you.sure" values={{count: selectedTorrents.length}} />
            </FormRow>
            <ModalActions
              actions={[
                {
                  checked: SettingStore.floodSettings.deleteTorrentData,
                  content: intl.formatMessage({
                    id: 'torrents.remove.delete.data',
                  }),
                  id: 'deleteData',
                  type: 'checkbox',
                },
                {
                  content: intl.formatMessage({
                    id: 'button.no',
                  }),
                  triggerDismiss: true,
                  type: 'tertiary',
                },
                {
                  content: intl.formatMessage({
                    id: 'button.yes',
                  }),
                  isLoading: isRemoving,
                  submit: true,
                  type: 'primary',
                },
              ]}
            />
          </Form>
        </div>
      }
    />
  );
};

export default RemoveTorrentsModal;
