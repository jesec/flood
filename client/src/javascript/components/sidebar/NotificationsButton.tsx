import classnames from 'classnames';
import {FC, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

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

interface NotificationTopToolbarProps {
  paginationStart: number;
  notificationTotal: number;
}

const NotificationTopToolbar: FC<NotificationTopToolbarProps> = ({
  paginationStart,
  notificationTotal,
}: NotificationTopToolbarProps) => {
  const {i18n} = useLingui();

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
          {`${i18n._('notification.showing')} `}
          <strong>
            {countStart}
            {` ${i18n._('general.to')} `}
            {countEnd}
          </strong>
          {` ${i18n._('general.of')} `}
          <strong>{notificationTotal}</strong>
        </span>
      </div>
    );
  }

  return null;
};

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: FC<NotificationItemProps> = ({notification}: NotificationItemProps) => {
  const {i18n} = useLingui();

  return (
    <li className="notifications__list__item">
      <div className="notification__heading">
        <span className="notification__category">{i18n._(`${notification.id}.heading`)}</span>
        {' — '}
        <span className="notification__timestamp">
          {i18n.date(new Date(notification.ts), {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </span>
      </div>
      <div className="notification__message">{i18n._(`${notification.id}.body`, notification.data)}</div>
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
  const {i18n} = useLingui();

  if (notificationTotal > 0) {
    let olderTo = paginationStart + NOTIFICATIONS_PER_PAGE * 2;
    let newerFrom = paginationStart - NOTIFICATIONS_PER_PAGE;

    if (olderTo > notificationTotal) {
      olderTo = notificationTotal;
    }

    if (newerFrom < 0) {
      newerFrom = 0;
    }

    return (
      <ul
        className="notifications__toolbar toolbar toolbar--dark
        toolbar--bottom"
      >
        <li
          className={classnames('toolbar__item toolbar__item--button', {
            'is-disabled': paginationStart === 0,
          })}
        >
          <button className="tooltip__content--padding-surrogate" type="button" onClick={onPrevClick}>
            <ChevronLeft />
            {`${newerFrom + 1} - ${paginationStart}`}
          </button>
        </li>
        <li className="toolbar__item toolbar__item--button">
          <button className="tooltip__content--padding-surrogate" type="button" onClick={onClearClick}>
            {i18n._('notification.clear.all')}
          </button>
        </li>
        <li
          className={classnames('toolbar__item toolbar__item--button', {
            'is-disabled': paginationStart + NOTIFICATIONS_PER_PAGE >= notificationTotal,
          })}
        >
          <button className="tooltip__content--padding-surrogate" type="button" onClick={onNextClick}>
            {`${paginationStart + NOTIFICATIONS_PER_PAGE + 1} - ${olderTo}`}
            <ChevronRight />
          </button>
        </li>
      </ul>
    );
  }

  return null;
};

const NotificationsButton: FC = observer(() => {
  const {i18n} = useLingui();

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
            })}
          >
            <NotificationTopToolbar paginationStart={paginationStart} notificationTotal={notificationCount.total} />
            <div className="notifications__loading-indicator">
              <LoadingIndicatorDots />
            </div>
            <ul
              className="notifications__list tooltip__content--padding-surrogate"
              ref={notificationsListRef}
              style={{minHeight: prevHeight}}
            >
              {notifications.map((notification, index) => (
                <NotificationItem key={index} notification={notification} />
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
            {i18n._('notification.no.notification')}
          </div>
        )
      }
      interactive
      onOpen={() => fetchNotifications(paginationStart)}
      ref={tooltipRef}
      width={340}
      position="bottom"
      wrapperClassName="sidebar__action sidebar__icon-button
          tooltip__wrapper"
    >
      <NotificationIcon />
      {hasNotification ? <span className="notifications__badge">{notificationCount.total}</span> : null}
    </Tooltip>
  );
});

export default NotificationsButton;
