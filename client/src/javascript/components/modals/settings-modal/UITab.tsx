import {FC, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Form, FormRow, Select, SelectItem, Radio} from '@client/ui';
import Languages from '@client/constants/Languages';
import SettingStore from '@client/stores/SettingStore';

import type {Language} from '@client/constants/Languages';

import type {FloodSettings} from '@shared/types/FloodSettings';

import ModalFormSectionHeader from '../ModalFormSectionHeader';
import MiscUISettingsList from './lists/MiscUISettingsList';
import TorrentContextMenuActionsList from './lists/TorrentContextMenuActionsList';
import TorrentListColumnsList from './lists/TorrentListColumnsList';

interface UITabProps {
  onSettingsChange: (changeSettings: Partial<FloodSettings>) => void;
}

const UITab: FC<UITabProps> = ({onSettingsChange}: UITabProps) => {
  const {i18n} = useLingui();
  const [torrentListViewSize, setTorrentListViewSize] = useState(SettingStore.floodSettings.torrentListViewSize);
  const [selectedLanguage, setSelectedLanguage] = useState(SettingStore.floodSettings.language);
  const [UITagSelectorMode, setUITagSelectorMode] = useState(SettingStore.floodSettings.UITagSelectorMode);

  return (
    <Form
      onChange={({event, formData}) => {
        const inputElement = event.target as HTMLInputElement;

        if (inputElement.type === 'radio') {
          setTorrentListViewSize(formData['ui-torrent-size'] as FloodSettings['torrentListViewSize']);
          setUITagSelectorMode(formData['ui-tag-selector-mode'] as FloodSettings['UITagSelectorMode']);
          onSettingsChange({
            torrentListViewSize,
            UITagSelectorMode,
          });
        }

        if (inputElement.name === 'language') {
          const newSelectedLanguage = formData.language as FloodSettings['language'];
          setSelectedLanguage(newSelectedLanguage);
          onSettingsChange({
            language: newSelectedLanguage,
          });
        }
      }}
    >
      <ModalFormSectionHeader key="locale-header">
        <Trans id="settings.ui.language" />
      </ModalFormSectionHeader>
      <FormRow key="locale-selection">
        <Select defaultID={selectedLanguage} id="language">
          {Object.keys(Languages).map((languageID) => (
            <SelectItem key={languageID} id={languageID}>
              {languageID === 'auto' ? i18n._(Languages[languageID].id) : (Languages[languageID as Language] as string)}
            </SelectItem>
          ))}
        </Select>
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.ui.tag.selector.mode" />
      </ModalFormSectionHeader>
      <FormRow>
        <Radio defaultChecked={UITagSelectorMode === 'single'} groupID="ui-tag-selector-mode" id="single" width="auto">
          <Trans id="settings.ui.tag.selector.mode.single" />
        </Radio>
        <Radio defaultChecked={UITagSelectorMode === 'multi'} groupID="ui-tag-selector-mode" id="multi" width="auto">
          <Trans id="settings.ui.tag.selector.mode.multi" />
        </Radio>
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.ui.torrent.list" />
      </ModalFormSectionHeader>
      <FormRow>
        <Radio defaultChecked={torrentListViewSize === 'expanded'} groupID="ui-torrent-size" id="expanded" width="auto">
          <Trans id="settings.ui.torrent.size.expanded" />
        </Radio>
        <Radio
          defaultChecked={torrentListViewSize === 'condensed'}
          groupID="ui-torrent-size"
          id="condensed"
          width="auto"
        >
          <Trans id="settings.ui.torrent.size.condensed" />
        </Radio>
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.ui.displayed.details" />
      </ModalFormSectionHeader>
      <FormRow>
        <TorrentListColumnsList torrentListViewSize={torrentListViewSize} onSettingsChange={onSettingsChange} />
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.ui.displayed.context.menu.items" />
      </ModalFormSectionHeader>
      <FormRow>
        <TorrentContextMenuActionsList onSettingsChange={onSettingsChange} />
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.ui.misc" />
      </ModalFormSectionHeader>
      <FormRow>
        <MiscUISettingsList onSettingsChange={onSettingsChange} />
      </FormRow>
    </Form>
  );
};

export default UITab;
