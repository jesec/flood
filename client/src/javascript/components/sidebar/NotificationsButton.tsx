import classnames from 'classnames';
import {defineMessages, useIntl} from 'react-intl';
import {FC, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react';

import FloodActions from '@client/actions/FloodActions';
import {ChevronLeft, ChevronRight, LoadingIndicatorDots, Notification as NotificationIcon} from '@client/ui/icons';
import NotificationStore from '@client/stores/NotificationStore';

import type {Notification} from '@shared/types/Notification';

import Tooltip from '../general/Tooltip';

const NOTIFICATIONS_PER_PAGE = 10;

const fetchNotifications = (paginationStart: number) =>
  FloodActions.fetchNotifications({
    id: 'notification-tooltip',
    limit: NOTIFICATIONS_PER_PAGE,
    start: paginationStart,
  });

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
});

interface NotificationTopToolbarProps {
  paginationStart: number;
  notificationTotal: number;
}

const NotificationTopToolbar: FC<NotificationTopToolbarProps> = ({
  paginationStart,
  notificationTotal,
}: NotificationTopToolbarProps) => {
  const intl = useIntl();

  if (notificationTotal > NOTIFICATIONS_PER_PAGE) {
    let countStart = paginationStart + 1;
    let countEnd = paginationStart + NOTIFICATIONS_PER_PAGE;

    if (countStart > notificationTotal) {
      countStart = notificationTotal;
    }

    if (countEnd > notificationTotal) {
      countEnd = notificationTotal;
    }

    return (
      <div className="toolbar toolbar--dark toolbar--top tooltip__toolbar tooltip__content--padding-surrogate">
        <span className="toolbar__item toolbar__item--label">
          {`${intl.formatMessage({
            id: 'notification.showing',
          })} `}
          <strong>
            {countStart}
            {` ${intl.formatMessage({
              id: 'general.to',
            })} `}
            {countEnd}
          </strong>
          {` ${intl.formatMessage({
            id: 'general.of',
          })} `}
          <strong>{notificationTotal}</strong>
        </span>
      </div>
    );
  }

  return null;
};

interface NotificationItemProps {
  index: number;
  notification: Notification;
}

const NotificationItem: FC<NotificationItemProps> = ({index, notification}: NotificationItemProps) => {
  const intl = useIntl();
  const date = intl.formatDate(notification.ts, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
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
        <span className="notification__timestamp">{`${date} ${intl.formatMessage({
          id: 'general.at',
        })} ${time}`}</span>
      </div>
      <div className="notification__message">
        {intl.formatMessage(
          MESSAGES[`${notification.id}.body` as keyof typeof MESSAGES] || {
            id: 'general.error.unknown',
          },
          notification.data,
        )}
      </div>
    </li>
  );
};

interface NotificationBottomToolbarProps {
  paginationStart: number;
  notificationTotal: number;
  onPrevClick: () => void;
  onNextClick: () => void;
  onClearClick: () => void;
}

const NotificationBottomToolbar: FC<NotificationBottomToolbarProps> = ({
  paginationStart,
  notificationTotal,
  onPrevClick,
  onClearClick,
  onNextClick,
}: NotificationBottomToolbarProps) => {
  const intl = useIntl();

  if (notificationTotal > 0) {
    const newerButtonClass = classnames('toolbar__item toolbar__item--button', 'tooltip__content--padding-surrogate', {
      'is-disabled': paginationStart === 0,
    });
    const olderButtonClass = classnames('toolbar__item toolbar__item--button', 'tooltip__content--padding-surrogate', {
      'is-disabled': paginationStart + NOTIFICATIONS_PER_PAGE >= notificationTotal,
    });

    const olderFrom = paginationStart + NOTIFICATIONS_PER_PAGE + 1;
    let olderTo = paginationStart + NOTIFICATIONS_PER_PAGE * 2;
    let newerFrom = paginationStart - NOTIFICATIONS_PER_PAGE;
    const newerTo = paginationStart;

    if (olderTo > notificationTotal) {
      olderTo = notificationTotal;
    }

    if (newerFrom < 0) {
      newerFrom = 0;
    }

    return (
      <ul
        className="notifications__toolbar toolbar toolbar--dark
        toolbar--bottom">
        <li className={newerButtonClass} onClick={onPrevClick}>
          <ChevronLeft />
          {`${newerFrom + 1} - ${newerTo}`}
        </li>
        <li
          className="toolbar__item toolbar__item--button
          tooltip__content--padding-surrogate"
          onClick={onClearClick}>
          {intl.formatMessage({
            id: 'notification.clear.all',
          })}
        </li>
        <li className={olderButtonClass} onClick={onNextClick}>
          {`${olderFrom} - ${olderTo}`}
          <ChevronRight />
        </li>
      </ul>
    );
  }

  return null;
};

const NotificationsButton: FC = observer(() => {
  const intl = useIntl();

  const tooltipRef = useRef<Tooltip>(null);
  const notificationsListRef = useRef<HTMLUListElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paginationStart, setPaginationStart] = useState<number>(0);
  const [prevHeight, setPrevHeight] = useState<number>(0);

  const {hasNotification, notifications, notificationCount} = NotificationStore;

  useEffect(() => {
    if (notificationCount.total > 0 && tooltipRef.current?.isOpen()) {
      setIsLoading(true);
      fetchNotifications(paginationStart).finally(() => setIsLoading(false));
    }
  }, [notificationCount, paginationStart]);

  return (
    <Tooltip
      contentClassName="tooltip__content tooltip__content--no-padding"
      content={
        hasNotification ? (
          <div
            className={classnames('notifications', {
              'notifications--is-loading': isLoading,
            })}>
            <NotificationTopToolbar paginationStart={paginationStart} notificationTotal={notificationCount.total} />
            <div className="notifications__loading-indicator">
              <LoadingIndicatorDots />
            </div>
            <ul
              className="notifications__list tooltip__content--padding-surrogate"
              ref={notificationsListRef}
              style={{minHeight: prevHeight}}>
              {notifications.map((notification, index) => (
                <NotificationItem index={index} notification={notification} />
              ))}
            </ul>
            <NotificationBottomToolbar
              paginationStart={paginationStart}
              notificationTotal={notificationCount.total}
              onPrevClick={() => {
                const newPaginationStart = paginationStart - NOTIFICATIONS_PER_PAGE;
                if (newPaginationStart >= 0) {
                  setPrevHeight(notificationsListRef.current?.clientHeight || 0);
                  setPaginationStart(newPaginationStart);
                }
              }}
              onClearClick={() => {
                if (tooltipRef.current != null) {
                  tooltipRef.current.dismissTooltip();
                }

                FloodActions.clearNotifications();

                setPrevHeight(0);
                setPaginationStart(0);
              }}
              onNextClick={() => {
                const newPaginationStart = paginationStart + NOTIFICATIONS_PER_PAGE;
                if (notificationCount.total > newPaginationStart) {
                  setPrevHeight(notificationsListRef.current?.clientHeight || 0);
                  setPaginationStart(newPaginationStart);
                }
              }}
            />
          </div>
        ) : (
          <div className="notifications tooltip__content--padding-surrogate" style={{textAlign: 'center'}}>
            {intl.formatMessage({
              id: 'notification.no.notification',
            })}
          </div>
        )
      }
      interactive
      onOpen={() => fetchNotifications(paginationStart)}
      ref={tooltipRef}
      width={340}
      position="bottom"
      wrapperClassName="sidebar__action sidebar__icon-button
          tooltip__wrapper">
      <NotificationIcon />
      {hasNotification ? <span className="notifications__badge">{notificationCount.total}</span> : null}
    </Tooltip>
  );
});

export default NotificationsButton;
