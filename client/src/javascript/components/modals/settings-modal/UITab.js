import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import {Form, FormRow, Select, SelectItem, Radio} from '../../../ui';
import Languages from '../../../constants/Languages';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsStore from '../../../stores/SettingsStore';
import SettingsTab from './SettingsTab';
import TorrentContextMenuItemsList from './lists/TorrentContextMenuItemsList';
import TorrentDetailItemsList from './lists/TorrentDetailItemsList';

class UITab extends SettingsTab {
  constructor(props) {
    super(props);

    this.state = {
      torrentListViewSize: SettingsStore.getFloodSettings('torrentListViewSize'),
      selectedLanguage: SettingsStore.getFloodSettings('language'),
    };
  }

  getLanguageSelectOptions() {
    return Object.keys(Languages).map((languageID) => {
      const selectedLanguageDefinition = Languages[languageID];

      if (languageID === 'auto') {
        return (
          <SelectItem key={languageID} id={languageID}>
            {this.props.intl.formatMessage(selectedLanguageDefinition)}
          </SelectItem>
        );
      }

      return (
        <SelectItem key={languageID} id={languageID}>
          {selectedLanguageDefinition}
        </SelectItem>
      );
    });
  }

  handleFormChange = ({event, formData}) => {
    if (event.target.type === 'radio') {
      const newState = {torrentListViewSize: formData['ui-torrent-size']};

      this.props.onSettingsChange(newState);
      this.setState(newState);
    }

    if (event.target.name === 'language') {
      const {language} = formData;

      this.setState({selectedLanguage: language});
      this.props.onSettingsChange({language});
    }
  };

  render() {
    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.ui.locale" />
        </ModalFormSectionHeader>
        <FormRow>
          <Select
            defaultID={this.state.selectedLanguage}
            id="language"
            label={<FormattedMessage id="settings.ui.language" />}>
            {this.getLanguageSelectOptions()}
          </Select>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.ui.torrent.list" />
        </ModalFormSectionHeader>
        <FormRow>
          <Radio
            checked={this.state.torrentListViewSize === 'expanded'}
            groupID="ui-torrent-size"
            id="expanded"
            width="auto">
            <FormattedMessage id="settings.ui.torrent.size.expanded" />
          </Radio>
          <Radio
            checked={this.state.torrentListViewSize === 'condensed'}
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
          <TorrentDetailItemsList
            torrentListViewSize={this.state.torrentListViewSize}
            onSettingsChange={this.props.onSettingsChange}
          />
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.ui.displayed.context.menu.items" />
        </ModalFormSectionHeader>
        <FormRow>
          <TorrentContextMenuItemsList onSettingsChange={this.props.onSettingsChange} />
        </FormRow>
      </Form>
    );
  }
}

export default injectIntl(UITab);
