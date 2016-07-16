import {defineMessages, injectIntl} from 'react-intl';
import React from 'react';

import SettingsIcon from '../Icons/SettingsIcon';
import UIActions from '../../actions/UIActions';

const messages = defineMessages({
  settings: {
    id: 'sidebar.button.settings',
    defaultMessage: 'Settings'
  }
});

class SettingsButton extends React.Component {
  constructor() {
    super();
  }

  handleSettingsButtonClick() {
    UIActions.displayModal({id: 'settings'});
  }

  render() {
    return (
      <a className="sidebar__action sidebar__icon-button
        sidebar__icon-button--settings"
        onClick={this.handleSettingsButtonClick}
        title={this.props.intl.formatMessage(messages.settings)}>
        <SettingsIcon />
      </a>
    );
  }
}

export default injectIntl(SettingsButton);
