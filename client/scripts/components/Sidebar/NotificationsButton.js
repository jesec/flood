import {defineMessages, injectIntl} from 'react-intl';
import React from 'react';

import FeedIcon from '../Icons/FeedIcon';
import FloodActions from '../../actions/FloodActions';
import Tooltip from '../General/Tooltip';
import UIActions from '../../actions/UIActions';

const MESSAGES = defineMessages({
  notifications: {
    id: 'sidebar.button.notifications',
    defaultMessage: 'Notifications'
  }
});

const METHODS_TO_BIND = ['handleNotificationsButtonClick'];

class NotificationsButton extends React.Component {
  constructor() {
    super();

    this.state = {isOpen: false};
    this.tooltipRef = null;

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    FloodActions.fetchNotifications();
  }

  handleNotificationsButtonClick() {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }

    this.setState({isOpen: true});
  }

  render() {
    let label = this.props.intl.formatMessage(MESSAGES.notifications);

    return (
      <Tooltip
        content={label}
        onClick={this.handleNotificationsButtonClick}
        ref={(ref) => this.tooltipRef = ref}
        position="bottom"
        wrapperClassName="sidebar__action sidebar__icon-button
          tooltip__wrapper">
        <FeedIcon />
      </Tooltip>
    );
  }
}

export default injectIntl(NotificationsButton);
