import {FC, useRef} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Button, FormRow, FormRowGroup, Textbox} from '@client/ui';

import {WatchedDirectory} from '@shared/types/Watch';
import TagSelect from '@client/components/general/form-elements/TagSelect';
import SettingStore from '@client/stores/SettingStore';
import FilesystemBrowserTextbox from '@client/components/general/form-elements/FilesystemBrowserTextbox';

interface WatchFormProps {
  currentWatch: WatchedDirectory | null;
  defaultWatch: Pick<WatchedDirectory,'label' | 'dir' | 'destination' | 'tags'>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const WatchesForm: FC<WatchFormProps> = ({
  currentWatch,
  defaultWatch,
  isSubmitting,
  onCancel
}: WatchFormProps) => {
  const {i18n} = useLingui();

  const dirTextboxRef = useRef<HTMLInputElement>(null);
  const destTextboxRef = useRef<HTMLInputElement>(null);
  const tagsTextboxRef = useRef<HTMLInputElement>(null);

  return (
    <FormRowGroup>
      <FormRow>
        <Textbox
          id="label"
          label={i18n._('feeds.label')}
          placeholder={i18n._('feeds.label')}
          defaultValue={currentWatch?.label ?? defaultWatch.label}
        />
      </FormRow>
      <FormRow>
        <FilesystemBrowserTextbox
          id="dir"
          label={i18n._('watches.dir')}
          ref={dirTextboxRef}
          selectable="directories"
          suggested={currentWatch?.dir ?? defaultWatch?.dir}
        />
      </FormRow>
      <FormRow>
        <FilesystemBrowserTextbox
          id="destination"
          label={i18n._('torrents.add.destination.label')}
          ref={destTextboxRef}
          selectable="directories"
          suggested={currentWatch?.destination ?? defaultWatch?.destination}
        />
    </FormRow>
    <FormRow>
      <TagSelect
        id="tags"
        label={i18n._('torrents.add.tags')}
        defaultValue={currentWatch?.tags ?? defaultWatch?.tags}
        onTagSelected={(tags) => {
          if (tagsTextboxRef.current != null) {
            const suggestedPath = SettingStore.floodSettings.torrentDestinations?.[tags[0]];
            if (typeof suggestedPath === 'string' && tagsTextboxRef.current != null) {
              tagsTextboxRef.current.value = suggestedPath;
              tagsTextboxRef.current.dispatchEvent(new Event('input', {bubbles: true}));
            }
          }
        }}
      />
    </FormRow>
      <FormRow>
        <Button labelOffset onClick={onCancel}>
          <Trans id="button.cancel" />
        </Button>
        <Button labelOffset type="submit" isLoading={isSubmitting}>
          <Trans id="button.save.feed" />
        </Button>
      </FormRow>
    </FormRowGroup>
  );
};

export default WatchesForm;
