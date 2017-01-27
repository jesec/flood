import _ from 'lodash';
import {formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AuthStore from '../../../stores/AuthStore';
import Radio from '../../General/FormElements/Radio';
import Close from '../../Icons/Close';
import Dropdown from '../../General/FormElements/Dropdown';
import EventTypes from '../../../constants/EventTypes';
import Languages from '../../../constants/Languages';
import SettingsStore from '../../../stores/SettingsStore';
import SettingsTab from './SettingsTab';

const METHODS_TO_BIND = [
  'handleItemSelect',
  'handleRadioToggleChange'
];

class UITab extends SettingsTab {
  constructor() {
    super(...arguments);

    this.state = {
      torrentListViewSize: SettingsStore.getFloodSettings('torrentListViewSize'),
      selectedLanguage: SettingsStore.getFloodSettings('language')
    };

    METHODS_TO_BIND.forEach((method) => {
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

  getRadioValue(name) {
    if (name === 'torrentListViewSizeExpanded') {
      return this.state.torrentListViewSize === 'expanded';
    }

    if (name === 'torrentListViewSizeCondensed') {
      return this.state.torrentListViewSize === 'condensed';
    }
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

  render() {
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
              defaultMessage="Torrent List"
              id="settings.ui.torrent.list" />
          </div>
          <div className="form__row">
            <div className="form__column form__column--auto">
              <label className="form__label">
                <FormattedMessage
                  defaultMessage="Torrent Size"
                  id="settings.ui.torrent.size"  />
              </label>
              <Radio
                checked={this.getRadioValue('torrentListViewSizeExpanded')}
                name="torrentListViewSizeExpanded"
                onChange={this.handleRadioToggleChange}
                useProps={true}>
                <FormattedMessage
                  id="settings.ui.torrent.size.expanded"
                  defaultMessage="Expanded" />
              </Radio>
            </div>
            <div className="form__column form__column--auto form__column--unlabeled">
              <Radio
                checked={this.getRadioValue('torrentListViewSizeCondensed')}
                name="torrentListViewSizeCondensed"
                onChange={this.handleRadioToggleChange}
                useProps={true}>
                <FormattedMessage
                  id="settings.ui.torrent.size.condensed"
                  defaultMessage="Condensed" />
              </Radio>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(UITab);
