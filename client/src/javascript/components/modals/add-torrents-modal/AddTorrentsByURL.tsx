import {FC, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';

import {css} from '@client/styled-system/css';
import ConfigStore from '@client/stores/ConfigStore';
import {Form, FormHandle, FormRow} from '@client/ui';
import {saveAddTorrentsUserPreferences} from '@client/util/userPreferences';
import SettingStore from '@client/stores/SettingStore';
import TorrentActions from '@client/actions/TorrentActions';
import UIStore from '@client/stores/UIStore';

import {DEFAULT_TAG} from './Defaults';
import AddTorrentsActions from './AddTorrentsActions';
import FilesystemBrowserTextbox from '../../general/form-elements/FilesystemBrowserTextbox';
import TagSelect from '../../general/form-elements/TagSelect';
import TextboxRepeater, {getTextArray} from '../../general/form-elements/TextboxRepeater';

type AddTorrentsByURLFormData = {
  [urls: string]: string;
} & {
  [cookies: string]: string;
} & {
  destination: string;
  isBasePath: boolean;
  isCompleted: boolean;
  isSequential: boolean;
  start: boolean;
  tags: string;
};

const AddTorrentsByURL: FC = () => {
  const formRef = useRef<FormHandle>(null);
  const textboxRef = useRef<HTMLInputElement>(null);
  const [isAddingTorrents, setIsAddingTorrents] = useState<boolean>(false);
  const {i18n} = useLingui();
  const defaultTag = DEFAULT_TAG.read();

  return (
    <Form className="inverse" ref={formRef}>
      <TextboxRepeater
        id="urls"
        label={
          <div>
            {i18n._('torrents.add.torrents.label')}
            {typeof navigator.registerProtocolHandler === 'function' && (
              <button
                className={css({
                  float: 'right',
                  _focus: {
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  },
                  _focusVisible: {
                    outline: 'dashed',
                  },
                })}
                type="button"
                onClick={() => {
                  if (typeof navigator.registerProtocolHandler === 'function') {
                    navigator.registerProtocolHandler('magnet', `${ConfigStore.baseURI}?action=add-urls&url=%s`);
                  }
                }}
              >
                <em className={css({fontSize: '0.8em'})}>{i18n._('torrents.add.tab.url.register.magnet.handler')}</em>
              </button>
            )}
          </div>
        }
        placeholder={i18n._('torrents.add.tab.url.input.placeholder')}
        defaultValues={
          (UIStore.activeModal?.id === 'add-torrents' &&
            UIStore.activeModal?.tab === 'by-url' &&
            UIStore.activeModal?.urls) || [{id: 0, value: ''}]
        }
      />
      <TextboxRepeater
        id="cookies"
        label={i18n._('torrents.add.cookies.label')}
        placeholder={i18n._('torrents.add.cookies.input.placeholder')}
      />
      <FormRow>
        <TagSelect
          id="tags"
          defaultValue={[defaultTag]}
          label={i18n._('torrents.add.tags')}
          onTagSelected={(tags) => {
            if (textboxRef.current != null) {
              const suggestedPath = SettingStore.floodSettings.torrentDestinations?.[tags[0]];
              if (typeof suggestedPath === 'string' && textboxRef.current != null) {
                textboxRef.current.value = suggestedPath;
                textboxRef.current.dispatchEvent(new Event('input', {bubbles: true}));
              }
            }
          }}
        />
      </FormRow>
      <FilesystemBrowserTextbox
        id="destination"
        label={i18n._('torrents.add.destination.label')}
        ref={textboxRef}
        selectable="directories"
        showBasePathToggle
        showCompletedToggle
        showSequentialToggle
      />
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

          const tags = formData.tags != null ? formData.tags.split(',').filter((tag) => tag.length > 0) : undefined;

          TorrentActions.addTorrentsByUrls({
            urls: urls as [string, ...string[]],
            cookies: processedCookies,
            destination: formData.destination,
            isBasePath: formData.isBasePath,
            isCompleted: formData.isCompleted,
            isSequential: formData.isSequential,
            start: formData.start,
            tags,
          }).then(() => {
            UIStore.setActiveModal(null);
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
