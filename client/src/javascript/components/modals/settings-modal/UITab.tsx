import {FormattedMessage, injectIntl} from 'react-intl';
import * as React from 'react';

import type {FloodSettings} from '@shared/types/FloodSettings';

import {Form, FormRow, Select, SelectItem, Radio} from '../../../ui';
import Languages from '../../../constants/Languages';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingStore from '../../../stores/SettingStore';
import SettingsTab from './SettingsTab';
import TorrentContextMenuActionsList from './lists/TorrentContextMenuActionsList';
import TorrentListColumnsList from './lists/TorrentListColumnsList';

import type {Language} from '../../../constants/Languages';

class UITab extends SettingsTab {
  torrentListViewSize = SettingStore.floodSettings.torrentListViewSize;
  selectedLanguage = SettingStore.floodSettings.language;

  getLanguageSelectOptions() {
    return Object.keys(Languages).map((languageID) => {
      return (
        <SelectItem key={languageID} id={languageID}>
          {Languages[languageID as 'auto'].id != null
            ? this.props.intl.formatMessage({
                id: Languages[languageID as 'auto'].id,
              })
            : Languages[languageID as Language]}
        </SelectItem>
      );
    });
  }

  handleFormChange = ({
    event,
    formData,
  }: {
    event: Event | React.FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.type === 'radio') {
      this.torrentListViewSize = formData['ui-torrent-size'] as FloodSettings['torrentListViewSize'];
      this.props.onSettingsChange({torrentListViewSize: this.torrentListViewSize});
    }

    if (inputElement.name === 'language') {
      this.selectedLanguage = formData.language as FloodSettings['language'];
      if (this.selectedLanguage === 'translate') {
        SettingStore.saveFloodSettings({language: 'translate'});
      } else {
        this.props.onSettingsChange({language: this.selectedLanguage});
      }
    }
  };

  render() {
    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader key="locale-header">
          <FormattedMessage id="settings.ui.locale" />
        </ModalFormSectionHeader>
        <FormRow key="locale-selection">
          <Select
            disabled={this.selectedLanguage === 'translate'}
            defaultID={this.selectedLanguage}
            id="language"
            label={<FormattedMessage id="settings.ui.language" />}>
            {this.getLanguageSelectOptions()}
          </Select>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.ui.torrent.list" />
        </ModalFormSectionHeader>
        <FormRow>
          <Radio checked={this.torrentListViewSize === 'expanded'} groupID="ui-torrent-size" id="expanded" width="auto">
            <FormattedMessage id="settings.ui.torrent.size.expanded" />
          </Radio>
          <Radio
            checked={this.torrentListViewSize === 'condensed'}
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
          <TorrentListColumnsList
            torrentListViewSize={this.torrentListViewSize}
            onSettingsChange={this.props.onSettingsChange}
          />
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.ui.displayed.context.menu.items" />
        </ModalFormSectionHeader>
        <FormRow>
          <TorrentContextMenuActionsList onSettingsChange={this.props.onSettingsChange} />
        </FormRow>
      </Form>
    );
  }
}

export default injectIntl(UITab);
