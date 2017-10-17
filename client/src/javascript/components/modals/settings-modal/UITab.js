import _ from 'lodash';
import classnames from 'classnames';
import {formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AuthStore from '../../../stores/AuthStore';
import Checkbox from '../../general/form-elements/Checkbox';
import ErrorIcon from '../../icons/ErrorIcon';
import Close from '../../icons/Close';
import Dropdown from '../../general/form-elements/Dropdown';
import EventTypes from '../../../constants/EventTypes';
import Languages from '../../../constants/Languages';
import Radio from '../../general/form-elements/Radio';
import SettingsStore from '../../../stores/SettingsStore';
import SettingsTab from './SettingsTab';
import SortableList from '../../general/SortableList';
import Tooltip from '../../general/Tooltip';
import TorrentProperties from '../../../constants/TorrentProperties';

const methodsToBind = [
  'handleDetailCheckboxValueChange',
  'handleItemSelect',
  'handleRadioToggleChange',
  'handleTorrentDetailsMouseDown',
  'handleTorrentDetailsMove',
  'renderTorrentDetailItem'
];

class UITab extends SettingsTab {
  constructor() {
    super(...arguments);

    this.tooltipRef = null;
    this.state = {
      torrentDetails: SettingsStore.getFloodSettings('torrentDetails'),
      torrentListViewSize: SettingsStore.getFloodSettings('torrentListViewSize'),
      selectedLanguage: SettingsStore.getFloodSettings('language')
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getDropdownHeader() {
    return (
      <a className="dropdown__button">
        <span className="dropdown__value">
          <FormattedMessage
            defaultMessage={Languages[this.state.selectedLanguage].defaultMessage}
            id={Languages[this.state.selectedLanguage].id} />
        </span>
      </a>
    );
  }

  getDropdownMenu() {
    let items = Object.keys(Languages).map((language) => {
      return {
        displayName: this.props.intl.formatMessage(
          Languages[language]
        ),
        selected: this.state.selectedLanguage === language,
        language
      };
    });

    // Dropdown expects an array of arrays.
    return [items];
  }

  getLockedIDs() {
    if (this.state.torrentListViewSize === 'expanded') {
      return ['name', 'eta', 'downloadRate', 'uploadRate'];
    }

    return [];
  }

  getRadioValue(name) {
    if (name === 'torrentListViewSizeExpanded') {
      return this.state.torrentListViewSize === 'expanded';
    }

    if (name === 'torrentListViewSizeCondensed') {
      return this.state.torrentListViewSize === 'condensed';
    }
  }

  handleDetailCheckboxValueChange(id, value) {
    let {torrentDetails} = this.state;

    torrentDetails = torrentDetails.map(detail => {
      if (detail.id === id) {
        detail.visible = value;
      }

      return detail;
    });

    this.props.onSettingsChange({torrentDetails});
    this.setState({torrentDetails});
  }

  handleItemSelect(item) {
    let {language} = item;

    this.setState({selectedLanguage: language});
    this.props.onSettingsChange({language});
  }

  handleRadioToggleChange(field, event) {
    let newState = {torrentListViewSize: null};

    if (field.name === 'torrentListViewSizeExpanded') {
      newState.torrentListViewSize = 'expanded';
    } else {
      newState.torrentListViewSize = 'condensed';
    }

    this.props.onSettingsChange(newState);
    this.setState(newState);
  }

  handleTorrentDetailsMouseDown() {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  }

  handleTorrentDetailsMove(items) {
    this.setState({torrentDetails: items});
    this.props.onSettingsChange({torrentDetails: items});
  }

  renderTorrentDetailItem(item, index) {
    const {id, visible} = item;
    let checkbox = null;
    let warning = null;

    if (!this.getLockedIDs().includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox checked={visible}
            onChange={value => {
              this.handleDetailCheckboxValueChange(id, value);
            }}>
            Enabled
          </Checkbox>
        </span>
      );
    }

    if (id === 'tags' && this.state.torrentListViewSize === 'expanded'
      && index < this.state.torrentDetails.length - 1) {
      const tooltipContent = (
        <FormattedMessage id="settings.ui.torrent.details.tags.placement"
          defaultMessage="In the expanded view, tags work best at the end of the list." />
      );

      warning = (
        <Tooltip className="tooltip tooltip--is-error"
          content={tooltipContent}
          offset={-5}
          ref={ref => this.tooltipRef = ref}
          scrollContainer={this.props.scrollContainer}
          width={200}
          wrapperClassName="sortable-list__content sortable-list__content--secondary tooltip__wrapper"
          wrapText={true}>
          <ErrorIcon />
        </Tooltip>
      );
    }

    return (
      <div className="sortable-list__content sortable-list__content__wrapper">
        {warning}
        <span className="sortable-list__content sortable-list__content--primary">
          <FormattedMessage id={TorrentProperties[id].id}
            defaultMessage={TorrentProperties[id].defaultMessage} />
        </span>
        {checkbox}
      </div>
    );
  }

  render() {
    const lockedIDs = this.getLockedIDs();
    let torrentDetailItems = this.state.torrentDetails.slice();

    if (this.state.torrentListViewSize === 'expanded') {
      let nextUnlockedIndex = lockedIDs.length;

      torrentDetailItems = torrentDetailItems.reduce(
        (accumulator, detail, index) => {
          let lockedIDIndex = lockedIDs.indexOf(detail.id);

          if (lockedIDIndex > -1) {
            accumulator[lockedIDIndex] = detail;
          } else {
            accumulator[nextUnlockedIndex++] = detail;
          }

          return accumulator;
        }, []);
    }

    return (
      <div className="form">
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              defaultMessage="Locale"
              id="settings.ui.locale" />
          </div>
          <div className="form__row">
            <div className="form__column form__column--auto">
              <label className="form__label">
                <FormattedMessage
                  defaultMessage="Language"
                  id="settings.ui.language"  />
              </label>
              <Dropdown
                handleItemSelect={this.handleItemSelect}
                header={this.getDropdownHeader()}
                menuItems={this.getDropdownMenu()} />
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              defaultMessage="Torrent List Display"
              id="settings.ui.torrent.list" />
          </div>
          <div className="form__row">
            <div className="form__column form__column--auto">
              <Radio
                checked={this.getRadioValue('torrentListViewSizeExpanded')}
                name="torrentListViewSizeExpanded"
                onChange={this.handleRadioToggleChange}
                useProps={true}>
                <FormattedMessage
                  id="settings.ui.torrent.size.expanded"
                  defaultMessage="Expanded View" />
              </Radio>
            </div>
            <div className="form__column form__column--auto form__column--unlabeled">
              <Radio
                checked={this.getRadioValue('torrentListViewSizeCondensed')}
                name="torrentListViewSizeCondensed"
                onChange={this.handleRadioToggleChange}
                useProps={true}>
                <FormattedMessage id="settings.ui.torrent.size.condensed"
                  defaultMessage="Condensed View" />
              </Radio>
            </div>
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage defaultMessage="Torrent Detail Columns"
                  id="settings.ui.displayed.details"  />
              </label>
              <SortableList className="sortable-list--torrent-details"
                items={torrentDetailItems}
                lockedIDs={lockedIDs}
                onMouseDown={this.handleTorrentDetailsMouseDown}
                onDrop={this.handleTorrentDetailsMove}
                renderItem={this.renderTorrentDetailItem} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(UITab);
