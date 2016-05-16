import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';
import ReactDOM from 'react-dom';

import EventTypes from '../../constants/EventTypes';
import NotificationStore from '../../stores/NotificationStore';

const METHODS_TO_BIND = ['handleNotificationChange'];

export default class NotificationList extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      notifications: []
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    NotificationStore.listen(EventTypes.NOTIFICATIONS_CHANGE, this.handleNotificationChange);
  }

  componentWillUnmount() {
    NotificationStore.unlisten(EventTypes.NOTIFICATIONS_CHANGE, this.handleNotificationChange);
  }

  getNotifications() {
    return this.state.notifications.map((notification, index) => {
      return (
        <li className="notifications__list__item" key={index}>
          {notification.content}
        </li>
      );
    });
  }

  handleNotificationChange() {
    this.setState({notifications: NotificationStore.getNotifications()});
  }

  render() {
    let notifications = null;

    if (this.state.notifications.length > 0) {
      notifications = (
        <ul className="notifications__list" key="notifications-list">
          {this.getNotifications()}
        </ul>
      );
    }

    return (
      <CSSTransitionGroup transitionName="notifications__list"
        transitionEnterTimeout={250} transitionLeaveTimeout={250}
        className="notifications">
        {notifications}
      </CSSTransitionGroup>
    );
  }
}
