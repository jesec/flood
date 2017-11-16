import React from 'react';

import AuthActions from '../../actions/AuthActions';
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
          tooltip__wrapper">
        <div onClick={this.handleLogoutClick}>
          x
        </div>
      </Tooltip>
    );
  }
}

export default NotificationsButton;
