import {FC, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';

import {Form, FormRow} from '@client/ui';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';

import Modal from '../Modal';
import TagSelect from '../../general/form-elements/TagSelect';

const SetTagsModal: FC = () => {
  const formRef = useRef<Form>(null);
  const {i18n} = useLingui();
  const [isSettingTags, setIsSettingTags] = useState<boolean>(false);

  return (
    <Modal
      heading={i18n._('torrents.set.tags.heading')}
      content={
        <div className="modal__content inverse">
          <Form ref={formRef}>
            <FormRow>
              <TagSelect
                defaultValue={TorrentStore.selectedTorrents
                  .map((hash: string) => TorrentStore.torrents[hash].tags)[0]
                  .slice()}
                id="tags"
                placeholder={i18n._('torrents.set.tags.enter.tags')}
              />
            </FormRow>
          </Form>
        </div>
      }
      actions={[
        {
          content: i18n._('button.cancel'),
          clickHandler: null,
          triggerDismiss: true,
          type: 'tertiary',
        },
        {
          content: i18n._('torrents.set.tags.button.set'),
          clickHandler: () => {
            if (formRef.current == null) {
              return;
            }

            const {selectedTorrents} = TorrentStore;
            const formData = formRef.current.getFormData() as {tags: string};
            const tags = formData.tags ? formData.tags.split(',').filter((tag) => !!tag) : [];

            setIsSettingTags(true);

            if (selectedTorrents?.length > 0) {
              TorrentActions.setTags({
                hashes: selectedTorrents as [string, ...string[]],
                tags,
              });
            }
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
