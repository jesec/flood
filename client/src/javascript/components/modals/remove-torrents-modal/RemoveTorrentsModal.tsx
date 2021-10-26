import {FC, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Form, FormRow} from '@client/ui';
import {saveDeleteTorrentsUserPreferences} from '@client/util/userPreferences';
import SettingStore from '@client/stores/SettingStore';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import Modal from '../Modal';
import ModalActions from '../ModalActions';

const RemoveTorrentsModal: FC = () => {
  const {i18n} = useLingui();
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const {selectedTorrents} = TorrentStore;

  if (selectedTorrents.length === 0) {
    return (
      <Modal
        heading={i18n._('torrents.remove')}
        content={
          <div className="modal__content inverse">
            <Form>
              <FormRow>
                <Trans id="torrents.remove.error.no.torrents.selected" />
              </FormRow>
            </Form>
          </div>
        }
        actions={[
          {
            clickHandler: null,
            content: i18n._('button.ok'),
            triggerDismiss: true,
            type: 'primary',
          },
        ]}
      />
    );
  }

  return (
    <Modal
      heading={i18n._('torrents.remove')}
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
                UIStore.setActiveModal(null);
              });
            }}
          >
            <FormRow>
              <Trans id="torrents.remove.are.you.sure" values={{count: selectedTorrents.length}} />
            </FormRow>
            <ModalActions
              actions={[
                {
                  checked: SettingStore.floodSettings.deleteTorrentData,
                  content: i18n._('torrents.remove.delete.data'),
                  id: 'deleteData',
                  type: 'checkbox',
                },
                {
                  content: i18n._('button.no'),
                  triggerDismiss: true,
                  type: 'tertiary',
                },
                {
                  content: i18n._('button.yes'),
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
