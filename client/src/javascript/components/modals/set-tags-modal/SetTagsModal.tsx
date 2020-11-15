import {FC, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import {Form, FormRow} from '../../../ui';
import Modal from '../Modal';
import TagSelect from '../../general/form-elements/TagSelect';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

const SetTagsModal: FC = () => {
  const formRef = useRef<Form>(null);
  const intl = useIntl();
  const [isSettingTags, setIsSettingTags] = useState<boolean>(false);

  return (
    <Modal
      heading={intl.formatMessage({
        id: 'torrents.set.tags.heading',
      })}
      content={
        <div className="modal__content inverse">
          <Form ref={formRef}>
            <FormRow>
              <TagSelect
                defaultValue={TorrentStore.selectedTorrents
                  .map((hash: string) => TorrentStore.torrents[hash].tags)[0]
                  .slice()}
                id="tags"
                placeholder={intl.formatMessage({
                  id: 'torrents.set.tags.enter.tags',
                })}
              />
            </FormRow>
          </Form>
        </div>
      }
      actions={[
        {
          content: intl.formatMessage({
            id: 'button.cancel',
          }),
          clickHandler: null,
          triggerDismiss: true,
          type: 'tertiary',
        },
        {
          content: intl.formatMessage({
            id: 'torrents.set.tags.button.set',
          }),
          clickHandler: () => {
            if (formRef.current == null) {
              return;
            }

            const formData = formRef.current.getFormData() as {tags: string};
            const tags = formData.tags ? formData.tags.split(',') : [];

            setIsSettingTags(true);
            TorrentActions.setTags({
              hashes: TorrentStore.selectedTorrents,
              tags,
            });
          },
          isLoading: isSettingTags,
          triggerDismiss: false,
          type: 'primary',
        },
      ]}
    />
  );
};

export default SetTagsModal;
