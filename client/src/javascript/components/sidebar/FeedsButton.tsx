import {FC, useRef} from 'react';
import {useLingui} from '@lingui/react';

import {Feed} from '@client/ui/icons';
import UIActions from '@client/actions/UIActions';

import Tooltip from '../general/Tooltip';

const FeedsButton: FC = () => {
  const {i18n} = useLingui();
  const tooltipRef = useRef<Tooltip>(null);

  return (
    <Tooltip
      content={i18n._('sidebar.button.feeds')}
      onClick={() => {
        if (tooltipRef.current != null) {
          tooltipRef.current.dismissTooltip();
        }

        UIActions.displayModal({id: 'feeds'});
      }}
      ref={tooltipRef}
      position="bottom"
      wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper">
      <Feed />
    </Tooltip>
  );
};

export default FeedsButton;
