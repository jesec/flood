import {Button, Form, FormError, FormRowItem, FormRow, LoadingRing, Textbox} from 'flood-ui-kit';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AuthStore from '../../../stores/AuthStore';
import Close from '../../icons/Close';
import EventTypes from '../../../constants/EventTypes';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import RtorrentConnectionTypeSelection from '../../general/RtorrentConnectionTypeSelection';
import SettingsTab from './SettingsTab';

class AuthTab extends SettingsTab {
  state = {
    addUserError: null,
    hasFetchedUserList: false,
    isAddingUser: false,
    users: [],
  };

  formData = {};
  formRef = null;

  componentWillMount() {
    this.setState({users: AuthStore.getUsers()});
  }

  componentDidMount() {
    AuthStore.listen(EventTypes.AUTH_LIST_USERS_SUCCESS, this.handleUserListChange);
    AuthStore.listen(EventTypes.AUTH_CREATE_USER_ERROR, this.handleUserAddError);
    AuthStore.listen(EventTypes.AUTH_CREATE_USER_SUCCESS, this.handleUserAddSuccess);
    AuthStore.listen(EventTypes.AUTH_DELETE_USER_SUCCESS, this.handleUserDeleteSuccess);

    AuthStore.fetchUserList();
  }

  componentWillUnmount() {
    AuthStore.unlisten(EventTypes.AUTH_LIST_USERS_SUCCESS, this.handleUserListChange);
    AuthStore.unlisten(EventTypes.AUTH_CREATE_USER_ERROR, this.handleUserAddError);
    AuthStore.unlisten(EventTypes.AUTH_CREATE_USER_SUCCESS, this.handleUserAddSuccess);
    AuthStore.unlisten(EventTypes.AUTH_DELETE_USER_SUCCESS, this.handleUserDeleteSuccess);
  }

  getUserList() {
    let userList = this.state.users.sort((a, b) => {
      return a.username.localeCompare(b.username);
    });

    const currentUsername = AuthStore.getCurrentUsername();

    return userList.map((user, index) => {
      const isCurrentUser = user.username === currentUsername;
      let badge = null;
      let removeIcon = null;

      if (!isCurrentUser) {
        removeIcon = (
          <span
            className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
            onClick={this.handleDeleteUserClick.bind(this, user.username)}>
            <Close />
          </span>
        );
      } else {
        badge = (
          <span className="interactive-list__label__tag tag">
            <FormattedMessage id="auth.current.user" defaultMessage="Current User" />
          </span>
        );
      }

      const classes = classnames('interactive-list__item', {
        'interactive-list__item--disabled': isCurrentUser,
      });

      return (
        <li className={classes} key={index}>
          <span className="interactive-list__label">
            <div className="interactive-list__label__text">{user.username}</div>
            {badge}
          </span>
          {removeIcon}
        </li>
      );
    });
  }

  handleDeleteUserClick(username) {
    AuthStore.deleteUser(username);
  }

  handleFormChange = ({formData}) => {
    this.formData = formData;
  };

  handleFormSubmit = formData => {
    if (this.formData.username === '') {
      this.setState({
        addUserError: this.props.intl.formatMessage({
          id: 'auth.error.username.empty',
          defaultMessage: 'Username cannot be empty.',
        }),
      });
    } else {
      this.setState({isAddingUser: true});
      AuthStore.createUser({
        username: this.formData.username,
        password: this.formData.password,
        host: this.formData.rtorrentHost,
        port: this.formData.rtorrentPort,
        socketPath: this.formData.rtorrentSocketPath,
      });
    }
  };

  handleUserListChange = () => {
    this.setState({hasFetchedUserList: true, users: AuthStore.getUsers()});
  };

  handleUserAddError = error => {
    this.setState({addUserError: error, isAddingUser: false});
  };

  handleUserAddSuccess = () => {
    this.formRef.resetForm();

    this.setState({addUserError: null, isAddingUser: false});

    AuthStore.fetchUserList();
  };

  handleUserDeleteSuccess() {
    AuthStore.fetchUserList();
  }

  render() {
    const isLoading = !this.state.hasFetchedUserList && this.state.users.length === 0;
    const interactiveListClasses = classnames('interactive-list', {
      'interactive-list--loading': isLoading,
    });
    let errorElement = null;
    let loadingIndicator = null;

    if (this.state.addUserError) {
      errorElement = (
        <FormRow>
          <FormError>{this.state.addUserError}</FormError>
        </FormRow>
      );
    }

    if (isLoading) {
      loadingIndicator = (
        <div className="interactive-list__loading-indicator" key="loading-indicator">
          <LoadingRing />
        </div>
      );
    }

    return (
      <Form onChange={this.handleFormChange} onSubmit={this.handleFormSubmit} ref={ref => (this.formRef = ref)}>
        <ModalFormSectionHeader>
          <FormattedMessage id="auth.user.accounts" defaultMessage="User Accounts" />
        </ModalFormSectionHeader>
        <FormRow>
          <FormRowItem>
            <ul className={interactiveListClasses}>
              <CSSTransitionGroup
                transitionName="interactive-list__loading-indicator"
                transitionEnterTimeout={250}
                transitionLeaveTimeout={250}>
                {loadingIndicator}
              </CSSTransitionGroup>
              {this.getUserList()}
            </ul>
          </FormRowItem>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="auth.add.user" defaultMessage="Add User" />
        </ModalFormSectionHeader>
        {errorElement}
        <FormRow>
          <Textbox
            id="username"
            label={<FormattedMessage id="auth.username" defaultMessage="Username" />}
            placeholder={this.props.intl.formatMessage({
              id: 'auth.username',
              defaultMessage: 'Username',
            })}
          />
          <Textbox
            id="password"
            label={<FormattedMessage id="auth.password" defaultMessage="Password" />}
            placeholder={this.props.intl.formatMessage({
              id: 'auth.password',
              defaultMessage: 'Password',
            })}
          />
        </FormRow>
        <RtorrentConnectionTypeSelection />
        <FormRow justify="end">
          <Button isLoading={this.state.isAddingUser} priority="primary" type="submit" width="auto">
            <FormattedMessage id="button.add" defaultMessage="Add" />
          </Button>
        </FormRow>
      </Form>
    );
  }
}

export default injectIntl(AuthTab);
