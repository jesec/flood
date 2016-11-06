import classnames from 'classnames';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ChevronLeftIcon from '../Icons/ChevronLeftIcon';
import ChevronRightIcon from '../Icons/ChevronRightIcon';
import CustomScrollbars from '../General/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import NotificationIcon from '../Icons/NotificationIcon';
import NotificationStore from '../../stores/NotificationStore';
import Tooltip from '../General/Tooltip';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const INTIAL_COUNT_STATE = {total: 0, unread: 0, read: 0};

const MESSAGES = defineMessages({
  notifications: {
    id: 'sidebar.button.notifications',
    defaultMessage: 'Notifications'
  },
  'notification.torrent.finished.heading': {
    id: 'notification.torrent.finished.heading',
    defaultMessage: 'Finished Downloading'
  },
  'notification.torrent.finished.body': {
    id: 'notification.torrent.finished.body',
    defaultMessage: '{name}'
  },
  'notification.torrent.errored.heading': {
    id: 'notification.torrent.errored.heading',
    defaultMessage: 'Error Reported'
  },
  'notification.torrent.errored.body': {
    id: 'notification.torrent.errored.body',
    defaultMessage: '{name}'
  },
  clearAll: {
    id: 'notification.clear.all',
    defaultMessage: 'Clear All'
  },
  showing: {
    id: 'notification.showing',
    defaultMessage: 'Showing'
  },
  at: {
    id: 'general.at',
    defaultMessage: 'at'
  },
  to: {
    id: 'general.to',
    defaultMessage: 'to'
  },
  of: {
    id: 'general.of',
    defaultMessage: 'of'
  }
});

const METHODS_TO_BIND = [
  'getBottomToolbar',
  'getNotification',
  'getTooltipContent',
  'handleClearNotificationsClick',
  'handleNotificationFetchSuccess',
  'handleNewerNotificationsClick',
  'handleOlderNotificationsClick'
];

const NOTIFICATIONS_PER_PAGE = 10;

class NotificationsButton extends React.Component {
  constructor() {
    super();

    this.state = {
      paginationStart: 0,
      count: INTIAL_COUNT_STATE,
      notifications: []
    };
    this.tooltipRef = null;

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    UIStore.registerDependency({
      id: 'notifications',
      message: (
        <FormattedMessage id="dependency.loading.notifications"
          defaultMessage="Notifications" />
      )
    });
  }

  componentDidMount() {
    NotificationStore.listen(EventTypes.NOTIFICATIONS_FETCH_SUCCESS,
      this.handleNotificationFetchSuccess);
    NotificationStore.fetchNotifications({
      id: 'notification-tooltip',
      limit: NOTIFICATIONS_PER_PAGE,
      start: this.state.paginationStart
    });
  }

  componentWillUnmount() {
    NotificationStore.unlisten(EventTypes.NOTIFICATIONS_FETCH_SUCCESS,
      this.handleNotificationFetchSuccess);
  }

  getBadge() {
    if (this.state.count.total > 0) {
      return (
        <span className="notifications__badge">
          {this.state.count.total}
        </span>
      );
    }

    return null;
  }

  getBottomToolbar() {
    if (this.state.count.total > 0) {
      let newerButtonClass = classnames('toolbar__item toolbar__item--button',
        'tooltip__content--padding-surrogate',
        {'is-disabled': this.state.paginationStart === 0});
      let olderButtonClass = classnames('toolbar__item toolbar__item--button',
        'tooltip__content--padding-surrogate',
        {
          'is-disabled': this.state.paginationStart + NOTIFICATIONS_PER_PAGE
            >= this.state.count.total
        });

      let olderFrom = this.state.paginationStart + NOTIFICATIONS_PER_PAGE + 1;
      let olderTo = this.state.paginationStart + NOTIFICATIONS_PER_PAGE * 2;
      let newerFrom = this.state.paginationStart - NOTIFICATIONS_PER_PAGE;
      let newerTo = this.state.paginationStart;

      if (olderTo > this.state.count.total) {
        olderTo = this.state.count.total;
      }

      if (newerFrom < 0) {
        newerFrom = 0;
      }

      return (
        <ul className="notifications__toolbar toolbar toolbar--dark
          toolbar--bottom">
          <li className={newerButtonClass}
            onClick={this.handleNewerNotificationsClick}>
            <ChevronLeftIcon /> {newerFrom + 1} &ndash; {newerTo}
          </li>
          <li className="toolbar__item toolbar__item--button
            tooltip__content--padding-surrogate"
            onClick={this.handleClearNotificationsClick}>
            {this.props.intl.formatMessage(MESSAGES.clearAll)}
          </li>
          <li className={olderButtonClass}
            onClick={this.handleOlderNotificationsClick}>
            {olderFrom} &ndash; {olderTo} <ChevronRightIcon />
          </li>
        </ul>
      );
    }

    return null;
  }

  getNotification(notification, index) {
    let date = this.props.intl.formatDate(notification.ts,
      {year: 'numeric', month: 'long', day: '2-digit'});
    let time = this.props.intl.formatTime(notification.ts);

    return (
      <li className="notifications__list__item" key={index}>
        <div className="notification__heading">
          <span className="notification__category">
            {this.props.intl.formatMessage(
              MESSAGES[`${notification.id}.heading`])}
          </span>
          {` — `}
          <span className="notification__timestamp">
            {date} {this.props.intl.formatMessage(MESSAGES.at)} {time}
          </span>
        </div>
        <div className="notification__message">
          {this.props.intl.formatMessage(MESSAGES[`${notification.id}.body`],
            notification.data)}
        </div>
      </li>
    );
  }

  getTopToolbar() {
    if (this.state.count.total > NOTIFICATIONS_PER_PAGE) {
      let countStart = this.state.paginationStart + 1;
      let countEnd = this.state.paginationStart + NOTIFICATIONS_PER_PAGE;

      if (countStart > this.state.count.total) {
        countStart = this.state.count.total;
      }

      if (countEnd > this.state.count.total) {
        countEnd = this.state.count.total;
      }

      return (
        <div className="toolbar toolbar--dark toolbar--top tooltip__toolbar tooltip__content--padding-surrogate">
          <span className="toolbar__item toolbar__item--label">
            {`${this.props.intl.formatMessage(MESSAGES.showing)} `}
            <strong>
              {countStart}
              {` ${this.props.intl.formatMessage(MESSAGES.to)} `}
              {countEnd}
            </strong>
            {` ${this.props.intl.formatMessage(MESSAGES.of)} `}
            <strong>{this.state.count.total}</strong>
          </span>
        </div>
      );
    }

    return null;
  }

  getTooltipContent() {
    if (this.state.count.total === 0) {
      return (
        <div className="notifications--empty
          tooltip__content--padding-surrogate">
          {this.props.intl.formatMessage(MESSAGES.notifications)}
        </div>
      );
    }

    let bottomToolbar = this.getBottomToolbar();
    let topToolbar = this.getTopToolbar();

    return (
      <div>
        {topToolbar}
        <CustomScrollbars
          autoHeight={true}
          autoHeightMin={0}
          autoHeightMax={300}
          inverted={true}>
          <ul className="notifications__list
            tooltip__content--padding-surrogate">
            {this.state.notifications.map(this.getNotification)}
          </ul>
        </CustomScrollbars>
        {bottomToolbar}
      </div>
    );
  }

  handleClearNotificationsClick() {
    this.setState({
      paginationStart: 0
    });

    NotificationStore.clearAll({
      id: 'notification-tooltip',
      limit: NOTIFICATIONS_PER_PAGE
    });

    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  }

  handleNotificationFetchSuccess() {
    let notificationState = NotificationStore.getNotifications('notification-tooltip');

    if (!notificationState) {
      notificationState = {count: INTIAL_COUNT_STATE, notifications: []};
    }

    this.setState(notificationState);
    UIStore.satisfyDependency('notifications');
  }

  handleNewerNotificationsClick() {
    if (this.state.paginationStart - NOTIFICATIONS_PER_PAGE >= 0) {
      this.setState({
        paginationStart: this.state.paginationStart - NOTIFICATIONS_PER_PAGE
      });

      NotificationStore.fetchNotifications({
        id: 'notification-tooltip',
        limit: NOTIFICATIONS_PER_PAGE,
        start: this.state.paginationStart - NOTIFICATIONS_PER_PAGE
      });
    }
  }

  handleOlderNotificationsClick() {
    if (this.state.count.total > this.state.paginationStart + NOTIFICATIONS_PER_PAGE) {
      this.setState({
        paginationStart: this.state.paginationStart + NOTIFICATIONS_PER_PAGE
      });

      NotificationStore.fetchNotifications({
        id: 'notification-tooltip',
        limit: NOTIFICATIONS_PER_PAGE,
        start: this.state.paginationStart + NOTIFICATIONS_PER_PAGE
      });
    }
  }

  render() {
    return (
      <Tooltip
        contentClassName="tooltip__content tooltip__content--no-padding"
        content={this.getTooltipContent()}
        interactive={true}
        ref={ref => this.tooltipRef = ref}
        width={this.state.count.total === 0 ? null : 340}
        position="bottom"
        wrapperClassName="sidebar__action sidebar__icon-button
          tooltip__wrapper">
        <NotificationIcon />
        {this.getBadge()}
      </Tooltip>
    );
  }
}

export default injectIntl(NotificationsButton);
