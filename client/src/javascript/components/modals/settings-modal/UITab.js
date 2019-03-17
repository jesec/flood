import {Checkbox, Form, FormRow, Select, SelectItem, Radio} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ErrorIcon from '../../icons/ErrorIcon';
import Languages from '../../../constants/Languages';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsStore from '../../../stores/SettingsStore';
import SettingsTab from './SettingsTab';
import SortableList from '../../general/SortableList';
import Tooltip from '../../general/Tooltip';
import TorrentProperties from '../../../constants/TorrentProperties';

class UITab extends SettingsTab {
  tooltipRef = null;
  state = {
    torrentDetails: SettingsStore.getFloodSettings('torrentDetails'),
    torrentListViewSize: SettingsStore.getFloodSettings('torrentListViewSize'),
    selectedLanguage: SettingsStore.getFloodSettings('language'),
  };

  getLanguageSelectOptions() {
    return Object.keys(Languages).map(languageID => {
      const selectedLanguageDefinition = Languages[languageID];

      return (
        <SelectItem key={languageID} id={languageID}>
          {this.props.intl.formatMessage(selectedLanguageDefinition)}
        </SelectItem>
      );
    });
  }

  getLockedIDs() {
    if (this.state.torrentListViewSize === 'expanded') {
      return ['name', 'eta', 'downloadRate', 'uploadRate'];
    }

    return [];
  }

  handleDetailCheckboxValueChange = (id, value) => {
    let {torrentDetails} = this.state;

    torrentDetails = torrentDetails.map(detail => {
      if (detail.id === id) {
        detail.visible = value;
      }

      return detail;
    });

    this.props.onSettingsChange({torrentDetails});
    this.setState({torrentDetails});
  };

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

  handleTorrentDetailsMouseDown = () => {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  };

  handleTorrentDetailsMove = items => {
    this.setState({torrentDetails: items});
    this.props.onSettingsChange({torrentDetails: items});
  };

  renderTorrentDetailItem = (item, index) => {
    const {id, visible} = item;
    let checkbox = null;
    let warning = null;

    if (!item.dragIndicator && !this.getLockedIDs().includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            checked={visible}
            onChange={event => this.handleDetailCheckboxValueChange(id, event.target.checked)}
            modifier="dark">
            <FormattedMessage id="settings.ui.torrent.details.enabled" defaultMessage="Enabled" />
          </Checkbox>
        </span>
      );
    }

    if (
      id === 'tags' &&
      this.state.torrentListViewSize === 'expanded' &&
      index < this.state.torrentDetails.length - 1
    ) {
      const tooltipContent = (
        <FormattedMessage
          id="settings.ui.torrent.details.tags.placement"
          defaultMessage="In the expanded view, tags work best at the end of the list."
        />
      );

      warning = (
        <Tooltip
          className="tooltip tooltip--is-error"
          content={tooltipContent}
          offset={-5}
          ref={ref => (this.tooltipRef = ref)}
          scrollContainer={this.props.scrollContainer}
          width={200}
          wrapperClassName="sortable-list__content sortable-list__content--secondary tooltip__wrapper"
          wrapText={true}>
          <ErrorIcon />
        </Tooltip>
      );
    }

    const content = (
      <div className="sortable-list__content sortable-list__content__wrapper">
        {warning}
        <span className="sortable-list__content sortable-list__content--primary">
          <FormattedMessage id={TorrentProperties[id].id} defaultMessage={TorrentProperties[id].defaultMessage} />
        </span>
        {checkbox}
      </div>
    );

    if (item.dragIndicator) {
      return <div className="sortable-list__item">{content}</div>;
    }

    return content;
  };

  render() {
    const lockedIDs = this.getLockedIDs();
    let torrentDetailItems = this.state.torrentDetails.slice();

    if (this.state.torrentListViewSize === 'expanded') {
      let nextUnlockedIndex = lockedIDs.length;

      torrentDetailItems = torrentDetailItems
        .reduce((accumulator, detail, index) => {
          let lockedIDIndex = lockedIDs.indexOf(detail.id);

          if (lockedIDIndex > -1) {
            accumulator[lockedIDIndex] = detail;
          } else {
            accumulator[nextUnlockedIndex++] = detail;
          }

          return accumulator;
        }, [])
        .filter(item => item != null);
    }

    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader>
          <FormattedMessage defaultMessage="Locale" id="settings.ui.locale" />
        </ModalFormSectionHeader>
        <FormRow>
          <Select
            defaultID={this.state.selectedLanguage}
            id="language"
            label={<FormattedMessage defaultMessage="Language" id="settings.ui.language" />}>
            {this.getLanguageSelectOptions()}
          </Select>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage defaultMessage="Torrent List Display" id="settings.ui.torrent.list" />
        </ModalFormSectionHeader>
        <FormRow>
          <Radio
            checked={this.state.torrentListViewSize === 'expanded'}
            groupID="ui-torrent-size"
            id="expanded"
            width="auto">
            <FormattedMessage id="settings.ui.torrent.size.expanded" defaultMessage="Expanded View" />
          </Radio>
          <Radio
            checked={this.state.torrentListViewSize === 'condensed'}
            groupID="ui-torrent-size"
            id="condensed"
            width="auto">
            <FormattedMessage id="settings.ui.torrent.size.condensed" defaultMessage="Condensed View" />
          </Radio>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage defaultMessage="Torrent Detail Columns" id="settings.ui.displayed.details" />
        </ModalFormSectionHeader>
        <FormRow>
          <SortableList
            className="sortable-list--torrent-details"
            items={torrentDetailItems}
            lockedIDs={lockedIDs}
            onMouseDown={this.handleTorrentDetailsMouseDown}
            onDrop={this.handleTorrentDetailsMove}
            renderItem={this.renderTorrentDetailItem}
          />
        </FormRow>
      </Form>
    );
  }
}

export default injectIntl(UITab);
