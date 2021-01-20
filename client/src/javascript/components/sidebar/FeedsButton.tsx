import {defineMessages, useIntl} from 'react-intl';
import {FC, useRef} from 'react';

import {Feed} from '@client/ui/icons';
import UIActions from '@client/actions/UIActions';

import Tooltip from '../general/Tooltip';

const MESSAGES = defineMessages({
  feeds: {
    id: 'sidebar.button.feeds',
  },
});

const FeedsButton: FC = () => {
  const intl = useIntl();
  const label = intl.formatMessage(MESSAGES.feeds);
  const tooltipRef = useRef<Tooltip>(null);

  return (
    <Tooltip
      content={label}
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
