import {defineMessages, injectIntl} from 'react-intl';
import React from 'react';

import AuthActions from '../../actions/AuthActions';
import Logout from '../icons/Logout';
import Tooltip from '../general/Tooltip';

const MESSAGES = defineMessages({
  logOut: {
    id: 'sidebar.button.log.out',
    defaultMessage: 'Log Out',
  },
});

class LogoutButton extends React.Component {
  handleLogoutClick() {
    AuthActions.logout().then(() => {
      window.location.reload();
    });
  }

  render() {
    return (
      <Tooltip
        content={this.props.intl.formatMessage(MESSAGES.logOut)}
        onClick={this.handleLogoutClick}
        position="bottom"
        wrapperClassName="sidebar__action sidebar__action--last
          sidebar__icon-button sidebar__icon-button--interactive
          tooltip__wrapper">
        <Logout />
      </Tooltip>
    );
  }
}

export default injectIntl(LogoutButton);
