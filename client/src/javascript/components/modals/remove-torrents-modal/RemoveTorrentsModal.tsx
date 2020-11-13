import {FC, useRef} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {Form, FormRow} from '../../../ui';
import Modal from '../Modal';
import {saveDeleteTorrentsUserPreferences} from '../../../util/userPreferences';
import SettingStore from '../../../stores/SettingStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

const RemoveTorrentsModal: FC = () => {
  const formRef = useRef<Form>(null);
  const intl = useIntl();
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
        <div className="modal__content inverse">
          <Form ref={formRef}>
            <FormRow>
              <FormattedMessage id="torrents.remove.are.you.sure" values={{count: selectedTorrents.length}} />
            </FormRow>
          </Form>
        </div>
      }
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
          clickHandler: null,
          content: intl.formatMessage({
            id: 'button.no',
          }),
          triggerDismiss: true,
          type: 'tertiary',
        },
        {
          clickHandler: () => {
            let deleteData = false;
            if (formRef.current != null) {
              deleteData = formRef.current.getFormData().deleteData as boolean;
            }

            TorrentActions.deleteTorrents({
              hashes: TorrentStore.selectedTorrents,
              deleteData,
            });

            saveDeleteTorrentsUserPreferences({deleteData});
          },
          content: intl.formatMessage({
            id: 'button.yes',
          }),
          triggerDismiss: true,
          type: 'primary',
        },
      ]}
    />
  );
};

export default RemoveTorrentsModal;
