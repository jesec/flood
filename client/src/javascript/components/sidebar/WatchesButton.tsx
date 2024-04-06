import {FC, useRef} from 'react';
import {useLingui} from '@lingui/react';

import UIStore from '@client/stores/UIStore';

import Tooltip from '../general/Tooltip';
import Watch from '@client/ui/icons/Watch';

const WatchesButton: FC = () => {
  const {i18n} = useLingui();
  const tooltipRef = useRef<Tooltip>(null);

  return (
    <Tooltip
      content={i18n._('sidebar.button.watches')}
      onClick={() => {
        if (tooltipRef.current != null) {
          tooltipRef.current.dismissTooltip();
        }

        UIStore.setActiveModal({id: 'watches'});
      }}
      ref={tooltipRef}
      position="bottom"
      wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper"
    >
      <Watch />
    </Tooltip>
  );
};

export default WatchesButton;
