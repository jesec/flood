import {FC, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import AddTorrentsActions from './AddTorrentsActions';
import FilesystemBrowserTextbox from '../../general/form-elements/FilesystemBrowserTextbox';
import {Form, FormRow} from '../../../ui';
import {saveAddTorrentsUserPreferences} from '../../../util/userPreferences';
import TagSelect from '../../general/form-elements/TagSelect';
import TextboxRepeater, {getTextArray} from '../../general/form-elements/TextboxRepeater';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

type AddTorrentsByURLFormData = {
  [urls: string]: string;
} & {
  [cookies: string]: string;
} & {
  destination: string;
  isBasePath: boolean;
  isCompleted: boolean;
  start: boolean;
  tags: string;
};

const AddTorrentsByURL: FC = () => {
  const formRef = useRef<Form>(null);
  const intl = useIntl();
  const [isAddingTorrents, setIsAddingTorrents] = useState<boolean>(false);

  return (
    <Form className="inverse" ref={formRef}>
      <TextboxRepeater
        id="urls"
        label={intl.formatMessage({
          id: 'torrents.add.torrents.label',
        })}
        placeholder={intl.formatMessage({
          id: 'torrents.add.tab.url.input.placeholder',
        })}
        defaultValues={
          (UIStore.activeModal?.id === 'add-torrents' && UIStore.activeModal?.initialURLs) || [{id: 0, value: ''}]
        }
      />
      <TextboxRepeater
        id="cookies"
        label={intl.formatMessage({
          id: 'torrents.add.cookies.label',
        })}
        placeholder={intl.formatMessage({
          id: 'torrents.add.cookies.input.placeholder',
        })}
      />
      <FilesystemBrowserTextbox
        id="destination"
        label={intl.formatMessage({
          id: 'torrents.add.destination.label',
        })}
        selectable="directories"
        showBasePathToggle
        showCompletedToggle
      />
      <FormRow>
        <TagSelect
          id="tags"
          label={intl.formatMessage({
            id: 'torrents.add.tags',
          })}
        />
      </FormRow>
      <AddTorrentsActions
        onAddTorrentsClick={() => {
          if (formRef.current == null) {
            return;
          }

          const formData = formRef.current.getFormData() as Partial<AddTorrentsByURLFormData>;
          setIsAddingTorrents(true);

          const urls = getTextArray(formData, 'urls').filter((url) => url !== '');

          if (urls.length === 0 || formData.destination == null) {
            setIsAddingTorrents(false);
            return;
          }

          const cookies = getTextArray(formData, 'cookies');

          // TODO: handle multiple domain names
          const firstDomain = urls[0].startsWith('http') && urls[0].split('/')[2];
          const processedCookies = firstDomain
            ? {
                [firstDomain]: cookies,
              }
            : undefined;

          const tags = formData.tags != null ? formData.tags.split(',') : undefined;

          TorrentActions.addTorrentsByUrls({
            urls: urls as [string, ...string[]],
            cookies: processedCookies,
            destination: formData.destination,
            isBasePath: formData.isBasePath,
            isCompleted: formData.isCompleted,
            start: formData.start,
            tags,
          }).then(() => {
            UIStore.dismissModal();
          });

          saveAddTorrentsUserPreferences({
            start: formData.start,
            destination: formData.destination,
            tags,
            tab: 'by-url',
          });
        }}
        isAddingTorrents={isAddingTorrents}
      />
    </Form>
  );
};

export default AddTorrentsByURL;
