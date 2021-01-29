import {FC} from 'react';
import {useLingui} from '@lingui/react';

import AuthActions from '@client/actions/AuthActions';
import ConfigStore from '@client/stores/ConfigStore';
import {Logout} from '@client/ui/icons';

import Tooltip from '../general/Tooltip';

const LogoutButton: FC = () => {
  const {i18n} = useLingui();

  if (ConfigStore.authMethod === 'none') {
    return null;
  }

  return (
    <Tooltip
      content={i18n._('sidebar.button.log.out')}
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
