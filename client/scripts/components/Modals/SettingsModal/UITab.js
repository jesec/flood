import _ from 'lodash';
import {formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AuthStore from '../../../stores/AuthStore';
import Checkbox from '../../General/FormElements/Checkbox';
import Close from '../../Icons/Close';
import Dropdown from '../../General/FormElements/Dropdown';
import EventTypes from '../../../constants/EventTypes';
import Languages from '../../../constants/Languages';
import SettingsStore from '../../../stores/SettingsStore';
import SettingsTab from './SettingsTab';

const METHODS_TO_BIND = [
  'handleItemSelect'
];

class UITab extends SettingsTab {
  constructor() {
    super(...arguments);

    this.state = {
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

  handleItemSelect(item) {
    let {language} = item;

    this.setState({selectedLanguage: language});
    this.props.onSettingsChange({language});
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
      </div>
    );
  }
}

export default injectIntl(UITab);
