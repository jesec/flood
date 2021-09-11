import {FC} from 'react';
import {useLingui} from '@lingui/react';

import ConfigStore from '@client/stores/ConfigStore';
import {ThemeSwitch} from '@client/ui/icons';

import Tooltip from '../general/Tooltip';

const ThemeSwitchButton: FC = () => {
  const {i18n} = useLingui();

  return (
    <Tooltip
      content={i18n._(ConfigStore.isPreferDark ? 'sidebar.button.theme.light' : 'sidebar.button.theme.dark')}
      onClick={() => ConfigStore.setUserPreferDark(!ConfigStore.isPreferDark)}
      position="bottom"
      wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper"
    >
      <ThemeSwitch />
    </Tooltip>
  );
};

export default ThemeSwitchButton;
