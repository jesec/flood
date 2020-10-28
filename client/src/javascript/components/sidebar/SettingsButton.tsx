import {defineMessages, useIntl} from 'react-intl';
import * as React from 'react';

import SettingsIcon from '../icons/SettingsIcon';
import Tooltip from '../general/Tooltip';
import UIActions from '../../actions/UIActions';

const MESSAGES = defineMessages({
  settings: {
    id: 'sidebar.button.settings',
  },
});

const SettingsButton: React.FC = () => {
  const intl = useIntl();
  const label = intl.formatMessage(MESSAGES.settings);
  const tooltipRef = React.useRef<Tooltip>(null);

  return (
    <Tooltip
      content={label}
      onClick={() => {
        if (tooltipRef.current != null) {
          tooltipRef.current.dismissTooltip();
        }

        UIActions.displayModal({id: 'settings'});
      }}
      ref={tooltipRef}
      position="bottom"
      wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper">
      <SettingsIcon />
    </Tooltip>
  );
};

export default SettingsButton;
