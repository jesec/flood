import classnames from 'classnames';
import {Component, createRef} from 'react';
import {defineMessages, injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';
import {reaction} from 'mobx';

import type {Notification} from '@shared/types/Notification';

import FloodActions from '../../actions/FloodActions';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import NotificationIcon from '../icons/NotificationIcon';
import NotificationStore from '../../stores/NotificationStore';
import Tooltip from '../general/Tooltip';

interface NotificationsButtonStates {
  isLoading: boolean;
  paginationStart: number;
  prevHeight: number;
}

const loadingIndicatorIcon = <LoadingIndicatorDots viewBox="0 0 32 32" />;

const MESSAGES = defineMessages({
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
  'notification.feed.torrent.added.heading': {
    id: 'notification.feed.torrent.added.heading',
  },
  'notification.feed.torrent.added.body': {
    id: 'notification.feed.torrent.added.body',
  },
  noNotification: {
    id: 'notification.no.notification',
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

@observer
class NotificationsButton extends Component<WrappedComponentProps, NotificationsButtonStates> {
  tooltipRef: Tooltip | null = null;
  notificationsListRef = createRef<HTMLUListElement>();

  constructor(props: WrappedComponentProps) {
    super(props);

    reaction(() => NotificationStore.notificationCount, this.handleNotificationCountChange);

    this.state = {
      isLoading: false,
      paginationStart: 0,
      prevHeight: 0,
    };
  }

  getBottomToolbar = () => {
    const {notificationCount} = NotificationStore;

    if (notificationCount.total > 0) {
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
          'is-disabled': this.state.paginationStart + NOTIFICATIONS_PER_PAGE >= notificationCount.total,
        },
      );

      const olderFrom = this.state.paginationStart + NOTIFICATIONS_PER_PAGE + 1;
      let olderTo = this.state.paginationStart + NOTIFICATIONS_PER_PAGE * 2;
      let newerFrom = this.state.paginationStart - NOTIFICATIONS_PER_PAGE;
      const newerTo = this.state.paginationStart;

      if (olderTo > notificationCount.total) {
        olderTo = notificationCount.total;
      }

      if (newerFrom < 0) {
        newerFrom = 0;
      }

      return (
        <ul
          className="notifications__toolbar toolbar toolbar--dark
          toolbar--bottom">
          <li className={newerButtonClass} onClick={this.handleNewerNotificationsClick}>
            <ChevronLeftIcon />
            {`${newerFrom + 1} - ${newerTo}`}
          </li>
          <li
            className="toolbar__item toolbar__item--button
            tooltip__content--padding-surrogate"
            onClick={this.handleClearNotificationsClick}>
            {this.props.intl.formatMessage(MESSAGES.clearAll)}
          </li>
          <li className={olderButtonClass} onClick={this.handleOlderNotificationsClick}>
            {`${olderFrom} - ${olderTo}`}
            <ChevronRightIcon />
          </li>
        </ul>
      );
    }

    return null;
  };

  getNotification = (notification: Notification, index: number) => {
    const {intl} = this.props;
    const date = intl.formatDate(notification.ts, {year: 'numeric', month: 'long', day: '2-digit'});
    const time = intl.formatTime(notification.ts);

    return (
      <li className="notifications__list__item" key={index}>
        <div className="notification__heading">
          <span className="notification__category">
            {intl.formatMessage(
              MESSAGES[`${notification.id}.heading` as keyof typeof MESSAGES] || {id: 'general.error.unknown'},
            )}
          </span>
          {' — '}
          <span className="notification__timestamp">{`${date} ${intl.formatMessage(MESSAGES.at)} ${time}`}</span>
        </div>
        <div className="notification__message">
          {intl.formatMessage(
            MESSAGES[`${notification.id}.body` as keyof typeof MESSAGES] || {id: 'general.error.unknown'},
            notification.data,
          )}
        </div>
      </li>
    );
  };

  getTopToolbar() {
    const {intl} = this.props;
    const {paginationStart} = this.state;

    const {notificationCount} = NotificationStore;

    if (notificationCount.total > NOTIFICATIONS_PER_PAGE) {
      let countStart = paginationStart + 1;
      let countEnd = paginationStart + NOTIFICATIONS_PER_PAGE;

      if (countStart > notificationCount.total) {
        countStart = notificationCount.total;
      }

      if (countEnd > notificationCount.total) {
        countEnd = notificationCount.total;
      }

      return (
        <div className="toolbar toolbar--dark toolbar--top tooltip__toolbar tooltip__content--padding-surrogate">
          <span className="toolbar__item toolbar__item--label">
            {`${intl.formatMessage(MESSAGES.showing)} `}
            <strong>
              {countStart}
              {` ${intl.formatMessage(MESSAGES.to)} `}
              {countEnd}
            </strong>
            {` ${intl.formatMessage(MESSAGES.of)} `}
            <strong>{notificationCount.total}</strong>
          </span>
        </div>
      );
    }

    return null;
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

  handleClearNotificationsClick = () => {
    this.setState({
      paginationStart: 0,
      prevHeight: 0,
    });

    FloodActions.clearNotifications({
      id: 'notification-tooltip',
      limit: NOTIFICATIONS_PER_PAGE,
      start: 0,
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
          prevHeight: this.notificationsListRef.current?.clientHeight || 0,
        };
      }, this.fetchNotifications);
    }
  };

  handleOlderNotificationsClick = () => {
    const {notificationCount} = NotificationStore;

    if (notificationCount.total > this.state.paginationStart + NOTIFICATIONS_PER_PAGE) {
      this.setState((state) => {
        const paginationStart = state.paginationStart + NOTIFICATIONS_PER_PAGE;
        return {
          paginationStart,
          prevHeight: this.notificationsListRef.current?.clientHeight || 0,
        };
      }, this.fetchNotifications);
    }
  };

  render() {
    const {intl} = this.props;
    const {isLoading, prevHeight} = this.state;
    const {notifications, notificationCount} = NotificationStore;

    const hasNotifications = notificationCount.total !== 0;

    return (
      <Tooltip
        contentClassName="tooltip__content tooltip__content--no-padding"
        content={
          hasNotifications ? (
            <div
              className={classnames('notifications', {
                'notifications--is-loading': isLoading,
              })}>
              {this.getTopToolbar()}
              <div className="notifications__loading-indicator">{loadingIndicatorIcon}</div>
              <ul
                className="notifications__list tooltip__content--padding-surrogate"
                ref={this.notificationsListRef}
                style={{minHeight: prevHeight}}>
                {notifications.map(this.getNotification)}
              </ul>
              {this.getBottomToolbar()}
            </div>
          ) : (
            <div className="notifications tooltip__content--padding-surrogate" style={{textAlign: 'center'}}>
              {intl.formatMessage(MESSAGES.noNotification)}
            </div>
          )
        }
        interactive
        onOpen={() => this.fetchNotifications()}
        ref={(ref) => {
          this.tooltipRef = ref;
        }}
        width={340}
        position="bottom"
        wrapperClassName="sidebar__action sidebar__icon-button
          tooltip__wrapper">
        <NotificationIcon />
        {hasNotifications ? <span className="notifications__badge">{notificationCount.total}</span> : null}
      </Tooltip>
    );
  }
}

export default injectIntl(NotificationsButton);
