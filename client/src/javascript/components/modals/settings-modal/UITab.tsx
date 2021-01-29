import {FormattedMessage, useIntl} from 'react-intl';
import {FC, useState} from 'react';

import {Form, FormRow, Select, SelectItem, Radio} from '@client/ui';
import Languages from '@client/constants/Languages';
import SettingStore from '@client/stores/SettingStore';

import type {Language} from '@client/constants/Languages';

import type {FloodSettings} from '@shared/types/FloodSettings';

import ModalFormSectionHeader from '../ModalFormSectionHeader';
import TorrentContextMenuActionsList from './lists/TorrentContextMenuActionsList';
import TorrentListColumnsList from './lists/TorrentListColumnsList';

interface UITabProps {
  onSettingsChange: (changeSettings: Partial<FloodSettings>) => void;
}

const UITab: FC<UITabProps> = ({onSettingsChange}: UITabProps) => {
  const intl = useIntl();
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
            language: selectedLanguage,
          });
        }
      }}>
      <ModalFormSectionHeader key="locale-header">
        <FormattedMessage id="settings.ui.language" />
      </ModalFormSectionHeader>
      <FormRow key="locale-selection">
        <Select defaultID={selectedLanguage} id="language">
          {Object.keys(Languages).map((languageID) => (
            <SelectItem key={languageID} id={languageID}>
              {Languages[languageID as 'auto'].id != null
                ? intl.formatMessage({
                    id: Languages[languageID as 'auto'].id,
                  })
                : Languages[languageID as Language]}
            </SelectItem>
          ))}
        </Select>
      </FormRow>
      <ModalFormSectionHeader>
        <FormattedMessage id="settings.ui.tag.selector.mode" />
      </ModalFormSectionHeader>
      <FormRow>
        <Radio defaultChecked={UITagSelectorMode === 'single'} groupID="ui-tag-selector-mode" id="single" width="auto">
          <FormattedMessage id="settings.ui.tag.selector.mode.single" />
        </Radio>
        <Radio defaultChecked={UITagSelectorMode === 'multi'} groupID="ui-tag-selector-mode" id="multi" width="auto">
          <FormattedMessage id="settings.ui.tag.selector.mode.multi" />
        </Radio>
      </FormRow>
      <ModalFormSectionHeader>
        <FormattedMessage id="settings.ui.torrent.list" />
      </ModalFormSectionHeader>
      <FormRow>
        <Radio defaultChecked={torrentListViewSize === 'expanded'} groupID="ui-torrent-size" id="expanded" width="auto">
          <FormattedMessage id="settings.ui.torrent.size.expanded" />
        </Radio>
        <Radio
          defaultChecked={torrentListViewSize === 'condensed'}
          groupID="ui-torrent-size"
          id="condensed"
          width="auto">
          <FormattedMessage id="settings.ui.torrent.size.condensed" />
        </Radio>
      </FormRow>
      <ModalFormSectionHeader>
        <FormattedMessage id="settings.ui.displayed.details" />
      </ModalFormSectionHeader>
      <FormRow>
        <TorrentListColumnsList torrentListViewSize={torrentListViewSize} onSettingsChange={onSettingsChange} />
      </FormRow>
      <ModalFormSectionHeader>
        <FormattedMessage id="settings.ui.displayed.context.menu.items" />
      </ModalFormSectionHeader>
      <FormRow>
        <TorrentContextMenuActionsList onSettingsChange={onSettingsChange} />
      </FormRow>
    </Form>
  );
};

export default UITab;
