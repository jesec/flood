import {FC, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';

import {Form, FormRow} from '@client/ui';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';

import Modal from '../Modal';
import CategorySelect from '../../general/form-elements/CategorySelect';

const SetCategoryModal: FC = () => {
  const formRef = useRef<Form>(null);
  const {i18n} = useLingui();
  const [isSettingCategory, setIsSettingCategory] = useState<boolean>(false);

  return (
    <Modal
      heading={i18n._('torrents.set.category.heading')}
      content={
        <div className="modal__content inverse">
          <Form ref={formRef}>
            <FormRow>
              <CategorySelect
                defaultValue={
                  TorrentStore.selectedTorrents.map((hash: string) => TorrentStore.torrents[hash].category)[0]
                }
                id="category"
                placeholder={i18n._('torrents.set.category.enter.category')}
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
          content: i18n._('torrents.set.category.button.set'),
          clickHandler: () => {
            if (formRef.current == null) {
              return;
            }

            const {selectedTorrents} = TorrentStore;
            const formData = formRef.current.getFormData() as {category: string};
            const category = formData.category ? formData.category : '';

            setIsSettingCategory(true);

            if (selectedTorrents?.length > 0) {
              TorrentActions.setCategory({
                hashes: selectedTorrents as [string, ...string[]],
                category,
              });
            }
          },
          isLoading: isSettingCategory,
          triggerDismiss: false,
          type: 'primary',
        },
      ]}
    />
  );
};

export default SetCategoryModal;
