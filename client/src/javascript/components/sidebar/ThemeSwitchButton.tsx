import {FC} from 'react';
import {useIntl} from 'react-intl';

import ConfigStore from '../../stores/ConfigStore';
import ThemeSwitchIcon from '../icons/ThemeSwitchIcon';
import Tooltip from '../general/Tooltip';

const ThemeSwitchButton: FC = () => {
  const intl = useIntl();

  return (
    <Tooltip
      content={intl.formatMessage({
        id: ConfigStore.preferDark ? 'sidebar.button.theme.light' : 'sidebar.button.theme.dark',
      })}
      onClick={() => ConfigStore.setUserPreferDark(!ConfigStore.preferDark)}
      position="bottom"
      wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper">
      <ThemeSwitchIcon />
    </Tooltip>
  );
};

export default ThemeSwitchButton;
