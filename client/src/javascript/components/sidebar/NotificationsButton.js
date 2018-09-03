import classnames from 'classnames';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import CustomScrollbars from '../general/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import NotificationIcon from '../icons/NotificationIcon';
import NotificationStore from '../../stores/NotificationStore';
import Tooltip from '../general/Tooltip';
import UIStore from '../../stores/UIStore';

const loadingIndicatorIcon = <LoadingIndicatorDots viewBox="0 0 32 32" />;

const INTIAL_COUNT_STATE = {total: 0, unread: 0, read: 0};

const MESSAGES = defineMessages({
  notifications: {
    id: 'sidebar.button.notifications',
    defaultMessage: 'Notifications',
  },
  'notification.torrent.finished.heading': {
    id: 'notification.torrent.finished.heading',
    defaultMessage: 'Finished Downloading',
  },
  'notification.torrent.finished.body': {
    id: 'notification.torrent.finished.body',
    defaultMessage: '{name}',
  },
  'notification.torrent.errored.heading': {
    id: 'notification.torrent.errored.heading',
    defaultMessage: 'Error Reported',
  },
  'notification.torrent.errored.body': {
    id: 'notification.torrent.errored.body',
    defaultMessage: '{name}',
  },
  'notification.feed.downloaded.torrent.heading': {
    id: 'notification.feed.downloaded.torrent.heading',
    defaultMessage: 'Matched Feed Rule',
  },
  clearAll: {
    id: 'notification.clear.all',
    defaultMessage: 'Clear All',
  },
  showing: {
    id: 'notification.showing',
    defaultMessage: 'Showing',
  },
  at: {
    id: 'general.at',
    defaultMessage: 'at',
  },
  to: {
    id: 'general.to',
    defaultMessage: 'to',
  },
  of: {
    id: 'general.of',
    defaultMessage: 'of',
  },
});

const METHODS_TO_BIND = [
  'getBottomToolbar',
  'getNotification',
  'getTooltipContent',
  'handleClearNotificationsClick',
  'handleNotificationFetchSuccess',
  'handleNotificationCountChange',
  'handleNewerNotificationsClick',
  'handleOlderNotificationsClick',
  'handleTooltipOpen',
];

const NOTIFICATIONS_PER_PAGE = 10;

class NotificationsButton extends React.Component {
  constructor() {
    super();

    this.state = {
      paginationStart: 0,
      count: INTIAL_COUNT_STATE,
      notifications: [],
    };
    this.tooltipRef = null;

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    UIStore.registerDependency({
      id: 'notifications',
      message: <FormattedMessage id="dependency.loading.notifications" defaultMessage="Notifications" />,
    });
  }

  componentDidMount() {
    NotificationStore.listen(EventTypes.NOTIFICATIONS_FETCH_SUCCESS, this.handleNotificationFetchSuccess);
    NotificationStore.listen(EventTypes.NOTIFICATIONS_FETCH_ERROR, this.handleNotificationFetchError);
    NotificationStore.listen(EventTypes.NOTIFICATIONS_COUNT_CHANGE, this.handleNotificationCountChange);
  }

  componentWillUnmount() {
    NotificationStore.unlisten(EventTypes.NOTIFICATIONS_FETCH_SUCCESS, this.handleNotificationFetchSuccess);
    NotificationStore.unlisten(EventTypes.NOTIFICATIONS_FETCH_ERROR, this.handleNotificationFetchError);
    NotificationStore.unlisten(EventTypes.NOTIFICATIONS_COUNT_CHANGE, this.handleNotificationCountChange);
  }

  getBadge() {
    if (this.state.count.total > 0) {
      return <span className="notifications__badge">{this.state.count.total}</span>;
    }

    return null;
  }

  getBottomToolbar() {
    if (this.state.count.total > 0) {
      let newerButtonClass = classnames('toolbar__item toolbar__item--button', 'tooltip__content--padding-surrogate', {
        'is-disabled': this.state.paginationStart === 0,
      });
      let olderButtonClass = classnames('toolbar__item toolbar__item--button', 'tooltip__content--padding-surrogate', {
        'is-disabled': this.state.paginationStart + NOTIFICATIONS_PER_PAGE >= this.state.count.total,
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
        <ul
          className="notifications__toolbar toolbar toolbar--dark
          toolbar--bottom">
          <li className={newerButtonClass} onClick={this.handleNewerNotificationsClick}>
            <ChevronLeftIcon /> {newerFrom + 1} &ndash; {newerTo}
          </li>
          <li
            className="toolbar__item toolbar__item--button
            tooltip__content--padding-surrogate"
            onClick={this.handleClearNotificationsClick}>
            {this.props.intl.formatMessage(MESSAGES.clearAll)}
          </li>
          <li className={olderButtonClass} onClick={this.handleOlderNotificationsClick}>
            {olderFrom} &ndash; {olderTo} <ChevronRightIcon />
          </li>
        </ul>
      );
    }

    return null;
  }

  getNotification(notification, index) {
    let date = this.props.intl.formatDate(notification.ts, {year: 'numeric', month: 'long', day: '2-digit'});
    let time = this.props.intl.formatTime(notification.ts);

    let notificationBody = null;

    if (notification.id === 'notification.feed.downloaded.torrent') {
      notificationBody = (
        <FormattedMessage
          id={`${notification.id}.body`}
          defaultMessage="{matchedDetails} — {title}"
          values={{
            matchedDetails: (
              <strong className="notification__message__sub-heading">
                {notification.data.ruleLabel}
                {' / '}
                {notification.data.feedLabel}
              </strong>
            ),
            title: notification.data.title,
          }}
        />
      );
    } else {
      notificationBody = this.props.intl.formatMessage(MESSAGES[`${notification.id}.body`], notification.data);
    }

    return (
      <li className="notifications__list__item" key={index}>
        <div className="notification__heading">
          <span className="notification__category">
            {this.props.intl.formatMessage(MESSAGES[`${notification.id}.heading`])}
          </span>
          {` — `}
          <span className="notification__timestamp">
            {date} {this.props.intl.formatMessage(MESSAGES.at)} {time}
          </span>
        </div>
        <div className="notification__message">{notificationBody}</div>
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
        <div
          className="notifications notifications--empty
          tooltip__content--padding-surrogate">
          {this.props.intl.formatMessage(MESSAGES.notifications)}
        </div>
      );
    }

    const {isLoading, notifications = []} = this.state;

    const notificationsWrapperClasses = classnames('notifications', {
      'notifications--is-loading': isLoading,
    });

    return (
      <div className={notificationsWrapperClasses}>
        {this.getTopToolbar()}
        <div className="notifications__loading-indicator">{loadingIndicatorIcon}</div>
        <CustomScrollbars autoHeight={true} autoHeightMin={0} autoHeightMax={300} inverted={true}>
          <ul className="notifications__list tooltip__content--padding-surrogate">
            {notifications.map(this.getNotification)}
          </ul>
        </CustomScrollbars>
        {this.getBottomToolbar()}
      </div>
    );
  }

  handleClearNotificationsClick() {
    this.setState({
      paginationStart: 0,
    });

    NotificationStore.clearAll({
      id: 'notification-tooltip',
      limit: NOTIFICATIONS_PER_PAGE,
    });

    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  }

  handleNotificationCountChange(notificationCount) {
    UIStore.satisfyDependency('notifications');
    this.setState({count: notificationCount});

    if (this.tooltipRef != null && this.tooltipRef.isOpen()) {
      this.setState({isLoading: true});

      NotificationStore.fetchNotifications({
        id: 'notification-tooltip',
        limit: NOTIFICATIONS_PER_PAGE,
        start: this.state.paginationStart,
      });
    }
  }

  handleNotificationFetchError() {
    UIStore.satisfyDependency('notifications');
  }

  handleNotificationFetchSuccess() {
    UIStore.satisfyDependency('notifications');

    let notificationState = {
      ...NotificationStore.getNotifications('notification-tooltip'),
      isLoading: false,
    };

    this.setState(notificationState);
  }

  handleNewerNotificationsClick() {
    if (this.state.paginationStart - NOTIFICATIONS_PER_PAGE >= 0) {
      this.setState({
        isLoading: true,
        paginationStart: this.state.paginationStart - NOTIFICATIONS_PER_PAGE,
      });

      NotificationStore.fetchNotifications({
        id: 'notification-tooltip',
        limit: NOTIFICATIONS_PER_PAGE,
        start: this.state.paginationStart - NOTIFICATIONS_PER_PAGE,
      });
    }
  }

  handleOlderNotificationsClick() {
    if (this.state.count.total > this.state.paginationStart + NOTIFICATIONS_PER_PAGE) {
      this.setState({
        isLoading: true,
        paginationStart: this.state.paginationStart + NOTIFICATIONS_PER_PAGE,
      });

      NotificationStore.fetchNotifications({
        id: 'notification-tooltip',
        limit: NOTIFICATIONS_PER_PAGE,
        start: this.state.paginationStart + NOTIFICATIONS_PER_PAGE,
      });
    }
  }

  handleTooltipOpen() {
    this.setState({isLoading: true});

    NotificationStore.fetchNotifications({
      id: 'notification-tooltip',
      limit: NOTIFICATIONS_PER_PAGE,
      start: this.state.paginationStart,
    });
  }

  render() {
    return (
      <Tooltip
        contentClassName="tooltip__content tooltip__content--no-padding"
        content={this.getTooltipContent()}
        interactive={this.state.count.total !== 0}
        onClose={this.handleTooltipClose}
        onOpen={this.handleTooltipOpen}
        ref={ref => (this.tooltipRef = ref)}
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
