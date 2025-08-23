import {FC} from 'react';
import {useLingui} from '@lingui/react';
import classnames from 'classnames';

import AuthActions from '@client/actions/AuthActions';
import ConfigStore from '@client/stores/ConfigStore';
import {Logout} from '@client/ui/icons';

import Tooltip from '../general/Tooltip';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: FC<LogoutButtonProps> = ({className}: LogoutButtonProps) => {
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
      wrapperClassName={classnames(
        'sidebar__action',
        'sidebar__action--last',
        'sidebar__icon-button',
        'sidebar__icon-button--interactive',
        'tooltip__wrapper',
        className,
      )}
    >
      <Logout />
    </Tooltip>
  );
};

LogoutButton.defaultProps = {
  className: undefined,
};

export default LogoutButton;
