import classnames from 'classnames';
import {defineMessages, FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import FloodActions from '../../actions/FloodActions';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import connectStores from '../../util/connectStores';
import CustomScrollbars from '../general/CustomScrollbars';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import NotificationIcon from '../icons/NotificationIcon';
import NotificationStore from '../../stores/NotificationStore';
import Tooltip from '../general/Tooltip';

import type {Notification, NotificationCount} from '../../stores/NotificationStore';

interface NotificationsButtonProps extends WrappedComponentProps {
  count?: NotificationCount;
  notifications?: Array<Notification>;
}

interface NotificationsButtonStates {
  isLoading: boolean;
  paginationStart: number;
}

const loadingIndicatorIcon = <LoadingIndicatorDots viewBox="0 0 32 32" />;

const MESSAGES = defineMessages({
  notifications: {
    id: 'sidebar.button.notifications',
  },
  'notification.torrent.finished.heading': {
    id: 'notification.torrent.finished.heading',
  },
  'notification.torrent.finished.body': {
    id: 'notification.torrent.finished.body',
  },
  'notification.torrent.errored.heading': {
    id: 'notification.torrent.errored.heading',
  },
  'notification.torrent.errored.body': {
    id: 'notification.torrent.errored.body',
  },
  'notification.feed.downloaded.torrent.heading': {
    id: 'notification.feed.downloaded.torrent.heading',
  },
  clearAll: {
    id: 'notification.clear.all',
  },
  showing: {
    id: 'notification.showing',
  },
  at: {
    id: 'general.at',
  },
  to: {
    id: 'general.to',
  },
  of: {
    id: 'general.of',
  },
});

const NOTIFICATIONS_PER_PAGE = 10;

class NotificationsButton extends React.Component<NotificationsButtonProps, NotificationsButtonStates> {
  tooltipRef: Tooltip | null = null;

  constructor(props: NotificationsButtonProps) {
    super(props);
    this.state = {
      isLoading: false,
      paginationStart: 0,
    };
  }

  componentDidMount() {
    NotificationStore.listen('NOTIFICATIONS_COUNT_CHANGE', this.handleNotificationCountChange);
  }

  componentWillUnmount() {
    NotificationStore.unlisten('NOTIFICATIONS_COUNT_CHANGE', this.handleNotificationCountChange);
  }

  fetchNotifications = () => {
    this.setState({isLoading: true});

    FloodActions.fetchNotifications({
      id: 'notification-tooltip',
      limit: NOTIFICATIONS_PER_PAGE,
      start: this.state.paginationStart,
    }).then(() => {
      this.setState({isLoading: false});
    });
  };

  getBadge() {
    if (this.props.count != null && this.props.count.total > 0) {
      return <span className="notifications__badge">{this.props.count.total}</span>;
    }

    return null;
  }

  getBottomToolbar = () => {
    if (this.props.count != null && this.props.count.total > 0) {
      const newerButtonClass = classnames(
        'toolbar__item toolbar__item--button',
        'tooltip__content--padding-surrogate',
        {
          'is-disabled': this.state.paginationStart === 0,
        },
      );
      const olderButtonClass = classnames(
        'toolbar__item toolbar__item--button',
        'tooltip__content--padding-surrogate',
        {
          'is-disabled': this.state.paginationStart + NOTIFICATIONS_PER_PAGE >= this.props.count.total,
        },
      );

      const olderFrom = this.state.paginationStart + NOTIFICATIONS_PER_PAGE + 1;
      let olderTo = this.state.paginationStart + NOTIFICATIONS_PER_PAGE * 2;
      let newerFrom = this.state.paginationStart - NOTIFICATIONS_PER_PAGE;
      const newerTo = this.state.paginationStart;

      if (olderTo > this.props.count.total) {
        olderTo = this.props.count.total;
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
            {olderFrom} &ndash;
            {olderTo} <ChevronRightIcon />
          </li>
        </ul>
      );
    }

    return null;
  };

  getNotification = (notification: Notification, index: number) => {
    const date = this.props.intl.formatDate(notification.ts, {year: 'numeric', month: 'long', day: '2-digit'});
    const time = this.props.intl.formatTime(notification.ts);

    let notificationBody = null;

    if (notification.id === 'notification.feed.downloaded.torrent') {
      notificationBody = (
        <FormattedMessage
          id={`${notification.id}.body`}
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
      const messageID = MESSAGES[`${notification.id}.body` as keyof typeof MESSAGES];
      notificationBody = this.props.intl.formatMessage(messageID, notification.data);
    }

    return (
      <li className="notifications__list__item" key={index}>
        <div className="notification__heading">
          <span className="notification__category">
            {this.props.intl.formatMessage(MESSAGES[`${notification.id}.heading` as keyof typeof MESSAGES])}
          </span>
          ' — '
          <span className="notification__timestamp">
            {date} {this.props.intl.formatMessage(MESSAGES.at)} {time}
          </span>
        </div>
        <div className="notification__message">{notificationBody}</div>
      </li>
    );
  };

  getTopToolbar() {
    if (this.props.count != null && this.props.count.total > NOTIFICATIONS_PER_PAGE) {
      let countStart = this.state.paginationStart + 1;
      let countEnd = this.state.paginationStart + NOTIFICATIONS_PER_PAGE;

      if (countStart > this.props.count.total) {
        countStart = this.props.count.total;
      }

      if (countEnd > this.props.count.total) {
        countEnd = this.props.count.total;
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
            <strong>{this.props.count.total}</strong>
          </span>
        </div>
      );
    }

    return null;
  }

  getTooltipContent = () => {
    if (this.props.count == null || this.props.count.total === 0) {
      return (
        <div
          className="notifications notifications--empty
          tooltip__content--padding-surrogate">
          {this.props.intl.formatMessage(MESSAGES.notifications)}
        </div>
      );
    }

    const {isLoading} = this.state;
    const {notifications = []} = this.props;

    const notificationsWrapperClasses = classnames('notifications', {
      'notifications--is-loading': isLoading,
    });

    return (
      <div className={notificationsWrapperClasses}>
        {this.getTopToolbar()}
        <div className="notifications__loading-indicator">{loadingIndicatorIcon}</div>
        <CustomScrollbars autoHeight autoHeightMin={0} autoHeightMax={300} inverted>
          <ul className="notifications__list tooltip__content--padding-surrogate">
            {notifications.map(this.getNotification)}
          </ul>
        </CustomScrollbars>
        {this.getBottomToolbar()}
      </div>
    );
  };

  handleClearNotificationsClick = () => {
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
  };

  handleNotificationCountChange = () => {
    if (this.tooltipRef != null && this.tooltipRef.isOpen()) {
      this.fetchNotifications();
    }
  };

  handleNewerNotificationsClick = () => {
    if (this.state.paginationStart - NOTIFICATIONS_PER_PAGE >= 0) {
      this.setState((state) => {
        const paginationStart = state.paginationStart - NOTIFICATIONS_PER_PAGE;
        return {
          paginationStart,
        };
      }, this.fetchNotifications);
    }
  };

  handleOlderNotificationsClick = () => {
    if (this.props.count != null && this.props.count.total > this.state.paginationStart + NOTIFICATIONS_PER_PAGE) {
      this.setState((state) => {
        const paginationStart = state.paginationStart + NOTIFICATIONS_PER_PAGE;
        return {
          paginationStart,
        };
      }, this.fetchNotifications);
    }
  };

  handleTooltipOpen = () => {
    this.fetchNotifications();
  };

  render() {
    return (
      <Tooltip
        contentClassName="tooltip__content tooltip__content--no-padding"
        content={this.getTooltipContent()}
        interactive={this.props.count != null && this.props.count.total !== 0}
        onOpen={this.handleTooltipOpen}
        ref={(ref) => {
          this.tooltipRef = ref;
        }}
        width={this.props.count == null || this.props.count.total === 0 ? null : 340}
        position="bottom"
        wrapperClassName="sidebar__action sidebar__icon-button
          tooltip__wrapper">
        <NotificationIcon />
        {this.getBadge()}
      </Tooltip>
    );
  }
}

const ConnectedNotificationsButton = connectStores<Omit<NotificationsButtonProps, 'intl'>, NotificationsButtonStates>(
  injectIntl(NotificationsButton),
  () => {
    return [
      {
        store: NotificationStore,
        event: 'NOTIFICATIONS_FETCH_SUCCESS',
        getValue: ({store}) => {
          const storeNotification = store as typeof NotificationStore;
          const tooltipNotificationState = storeNotification.getNotifications('notification-tooltip');

          return {
            count: tooltipNotificationState.count,
            limit: tooltipNotificationState.limit,
            notifications: tooltipNotificationState.notifications,
            start: tooltipNotificationState.start,
          };
        },
      },
      {
        store: NotificationStore,
        event: 'NOTIFICATIONS_COUNT_CHANGE',
        getValue: ({store}) => {
          const storeNotification = store as typeof NotificationStore;
          return {
            count: storeNotification.getNotificationCount(),
          };
        },
      },
    ];
  },
);

export default ConnectedNotificationsButton;
