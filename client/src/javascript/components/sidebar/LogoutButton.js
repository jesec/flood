import React from 'react';

import AuthActions from '../../actions/AuthActions';
import Logout from '../icons/Logout';
import Tooltip from '../general/Tooltip';

class NotificationsButton extends React.Component {
  handleLogoutClick() {
    AuthActions.logout().then(() => {
      window.location.reload();
    });
  }

  render() {
    return (
      <Tooltip
        content="Logout"
        position="bottom"
        wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper">
        <div onClick={this.handleLogoutClick}>
          <Logout />
        </div>
      </Tooltip>
    );
  }
}

export default NotificationsButton;
