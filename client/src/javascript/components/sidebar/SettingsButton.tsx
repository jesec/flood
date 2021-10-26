import {FC, useRef} from 'react';
import {useLingui} from '@lingui/react';

import {Settings} from '@client/ui/icons';
import UIStore from '@client/stores/UIStore';

import Tooltip from '../general/Tooltip';

const SettingsButton: FC = () => {
  const {i18n} = useLingui();
  const tooltipRef = useRef<Tooltip>(null);

  return (
    <Tooltip
      content={i18n._('sidebar.button.settings')}
      onClick={() => {
        if (tooltipRef.current != null) {
          tooltipRef.current.dismissTooltip();
        }

        UIStore.setActiveModal({id: 'settings'});
      }}
      ref={tooltipRef}
      position="bottom"
      wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper"
    >
      <Settings />
    </Tooltip>
  );
};

export default SettingsButton;
