import {Button, Checkbox, Form, FormError, FormRowItem, FormRow, LoadingRing, Textbox} from 'flood-ui-kit';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AuthActions from '../../../actions/AuthActions';
import AuthStore from '../../../stores/AuthStore';
import Close from '../../icons/Close';
import connectStores from '../../../util/connectStores';
import EventTypes from '../../../constants/EventTypes';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import RtorrentConnectionTypeSelection from '../../general/RtorrentConnectionTypeSelection';
import SettingsTab from './SettingsTab';

class AuthTab extends SettingsTab {
  state = {
    addUserError: null,
    hasFetchedUserList: false,
    isAddingUser: false,
  };

  formData = {};

  formRef = null;

  componentDidMount() {
    if (!this.props.isAdmin) return;

    AuthActions.fetchUsers().then(() => {
      this.setState({hasFetchedUserList: true});
    });
  }

  getUserList() {
    const userList = this.props.users.sort((a, b) => a.username.localeCompare(b.username));

    const currentUsername = AuthStore.getCurrentUsername();

    return userList.map(user => {
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
        <li className={classes} key={user.username}>
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
    AuthActions.deleteUser(username).then(AuthActions.fetchUsers);
  }

  handleFormChange = ({formData}) => {
    this.formData = formData;
  };

  handleFormSubmit = () => {
    if (this.formData.username === '') {
      this.setState({
        addUserError: this.props.intl.formatMessage({
          id: 'auth.error.username.empty',
          defaultMessage: 'Username cannot be empty.',
        }),
      });
    } else {
      this.setState({isAddingUser: true});

      AuthActions.createUser({
        username: this.formData.username,
        password: this.formData.password,
        host: this.formData.rtorrentHost,
        port: this.formData.rtorrentPort,
        socketPath: this.formData.rtorrentSocketPath,
        isAdmin: this.formData.isAdmin === '1',
      })
        .then(AuthActions.fetchUsers, error => {
          this.setState({addUserError: error.response.data.message, isAddingUser: false});
        })
        .then(() => {
          this.formRef.resetForm();
          this.setState({addUserError: null, isAddingUser: false});
        });
    }
  };

  render() {
    if (!this.props.isAdmin) {
      return (
        <Form>
          <ModalFormSectionHeader>
            <FormattedMessage id="auth.user.accounts" defaultMessage="User Accounts" />
          </ModalFormSectionHeader>
          <FormRow>
            <FormError>
              <FormattedMessage id="auth.message.not.admin" defaultMessage="User is not Admin" />
            </FormError>
          </FormRow>
        </Form>
      );
    }

    const isLoading = !this.state.hasFetchedUserList && this.props.users.length === 0;
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
      <Form
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={ref => {
          this.formRef = ref;
        }}>
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
          <Checkbox grow={false} id="isAdmin" labelOffset matchTextboxHeight>
            <FormattedMessage id="auth.admin" defaultMessage="Admin" />
          </Checkbox>
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

const ConnectedAuthTab = connectStores(injectIntl(AuthTab), () => {
  return [
    {
      store: AuthStore,
      event: EventTypes.AUTH_LIST_USERS_SUCCESS,
      getValue: ({store}) => {
        return {
          users: store.getUsers(),
          isAdmin: store.isAdmin(),
        };
      },
    },
  ];
});

export default ConnectedAuthTab;
