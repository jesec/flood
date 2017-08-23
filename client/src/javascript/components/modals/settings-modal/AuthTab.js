import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AuthStore from '../../../stores/AuthStore';
import Close from '../../icons/Close';
import EventTypes from '../../../constants/EventTypes';
import SettingsTab from './SettingsTab';

const METHODS_TO_BIND = [
  'handleAddUserClick',
  'handleUserAddError',
  'handleUserAddSuccess',
  'handleUserListChange'
];

class AuthTab extends SettingsTab {
  constructor() {
    super(...arguments);

    this.state = {
      addUserError: null,
      users: []
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.setState({users: AuthStore.getUsers()});
  }

  componentDidMount() {
    AuthStore.listen(EventTypes.AUTH_LIST_USERS_SUCCESS,
      this.handleUserListChange);
    AuthStore.listen(EventTypes.AUTH_CREATE_USER_ERROR,
      this.handleUserAddError);
    AuthStore.listen(EventTypes.AUTH_CREATE_USER_SUCCESS,
      this.handleUserAddSuccess);
    AuthStore.listen(EventTypes.AUTH_DELETE_USER_SUCCESS,
      this.handleUserDeleteSuccess);
  }

  componentWillUnmount() {
    AuthStore.unlisten(EventTypes.AUTH_LIST_USERS_SUCCESS,
      this.handleUserListChange);
    AuthStore.unlisten(EventTypes.AUTH_CREATE_USER_ERROR,
      this.handleUserAddError);
    AuthStore.unlisten(EventTypes.AUTH_CREATE_USER_SUCCESS,
      this.handleUserAddSuccess);
    AuthStore.unlisten(EventTypes.AUTH_DELETE_USER_SUCCESS,
      this.handleUserDeleteSuccess);
  }

  getUserList() {
    let userList = this.state.users.sort((a, b) => {
      return a.username.localeCompare(b.username);
    });

    return userList.map((user, index) => {
      return (
        <li className="interactive-list__item" key={index}>
          <span className="interactive-list__label">
            {user.username}
          </span>
          <span className="interactive-list__icon
            interactive-list__icon--action"
            onClick={this.handleDeleteUserClick.bind(this, user.username)}>
            <Close />
          </span>
        </li>
      );
    });
  }

  handleAddUserClick() {
    if (this.refs.username.value === '') {
      this.setState({
        addUserError: this.props.intl.formatMessage({
          id: 'auth.error.username.empty',
          defaultMessage: 'Username cannot be empty.'
        })
      });
    } else {
      AuthStore.createUser({
        username: this.refs.username.value,
        password: this.refs.password.value
      });
    }
  }

  handleDeleteUserClick(username) {
    AuthStore.deleteUser(username);
  }

  handleUserListChange() {
    this.setState({users: AuthStore.getUsers()});
  }

  handleUserAddError(error) {
    this.setState({addUserError: error});
  }

  handleUserAddSuccess() {
    this.refs.username.value = '';
    this.refs.password.value = '';

    this.setState({addUserError: null});

    AuthStore.fetchUserList();
  }

  handleUserDeleteSuccess() {
    AuthStore.fetchUserList();
  }

  render() {
    let error = null;

    if (this.state.addUserError) {
      error = (
        <div className="form__row">
          <div className="form__column">
            {this.state.addUserError}
          </div>
        </div>
      );
    }

    return (
      <div className="form">
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              id="auth.user.accounts"
              defaultMessage="User Accounts"
            />
          </div>
          <div className="form__row">
            <div className="form__column">
              <ul className="interactive-list">
                {this.getUserList()}
              </ul>
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              id="auth.add.user"
              defaultMessage="Add User"
            />
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="auth.username"
                  defaultMessage="Username"
                />
              </label>
              <input className="textbox"
                placeholder={this.props.intl.formatMessage({
                  id: 'auth.username',
                  defaultMessage: 'Username'
                })} ref="username" type="text" />
            </div>
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="auth.password"
                  defaultMessage="Password"
                />
              </label>
              <input className="textbox"
                placeholder={this.props.intl.formatMessage({
                  id: 'auth.password',
                  defaultMessage: 'Password'
                })} ref="password" type="password" />
            </div>
            <div className="form__column form__column--auto form__column--unlabled">
              <button className="button button--primary"
                onClick={this.handleAddUserClick}>
                <FormattedMessage
                  id="button.add"
                  defaultMessage="Add"
                />
              </button>
            </div>
          </div>
          {error}
        </div>
      </div>
    );
  }
}

export default injectIntl(AuthTab);
