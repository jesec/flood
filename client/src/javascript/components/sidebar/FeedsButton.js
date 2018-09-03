import {defineMessages, injectIntl} from 'react-intl';
import React from 'react';

import FeedIcon from '../icons/FeedIcon';
import Tooltip from '../general/Tooltip';
import UIActions from '../../actions/UIActions';

const MESSAGES = defineMessages({
  feeds: {
    id: 'sidebar.button.feeds',
    defaultMessage: 'Feeds',
  },
});

const METHODS_TO_BIND = ['handleFeedsButtonClick'];

class FeedsButton extends React.Component {
  constructor() {
    super();

    this.tooltipRef = null;

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleFeedsButtonClick() {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }

    UIActions.displayModal({id: 'feeds'});
  }

  render() {
    let label = this.props.intl.formatMessage(MESSAGES.feeds);

    return (
      <Tooltip
        content={label}
        onClick={this.handleFeedsButtonClick}
        ref={ref => (this.tooltipRef = ref)}
        position="bottom"
        wrapperClassName="sidebar__action sidebar__icon-button
          sidebar__icon-button--interactive tooltip__wrapper">
        <FeedIcon />
      </Tooltip>
    );
  }
}

export default injectIntl(FeedsButton);
