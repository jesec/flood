import {useIntl} from 'react-intl';
import React from 'react';

import AuthActions from '../../actions/AuthActions';
import ConfigStore from '../../stores/ConfigStore';
import Logout from '../icons/Logout';
import Tooltip from '../general/Tooltip';

const LogoutButton = () => {
  if (ConfigStore.disableAuth) {
    return null;
  }

  const intl = useIntl();

  return (
    <Tooltip
      content={intl.formatMessage({
        id: 'sidebar.button.log.out',
      })}
      onClick={() =>
        AuthActions.logout().then(() => {
          window.location.reload();
        })
      }
      position="bottom"
      wrapperClassName="sidebar__action sidebar__action--last
          sidebar__icon-button sidebar__icon-button--interactive
          tooltip__wrapper">
      <Logout />
    </Tooltip>
  );
};

export default LogoutButton;
