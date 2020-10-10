import classnames from 'classnames';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import {AccessLevel, Credentials} from '@shared/schema/Auth';

import {Button, Checkbox, Form, FormError, FormRowItem, FormRow, LoadingRing, Textbox} from '../../../ui';
import AuthActions from '../../../actions/AuthActions';
import AuthStore from '../../../stores/AuthStore';
import ClientConnectionSettingsForm from '../../general/connection-settings/ClientConnectionSettingsForm';
import Close from '../../icons/Close';
import connectStores from '../../../util/connectStores';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsTab from './SettingsTab';

import type {ClientConnectionSettingsFormType} from '../../general/connection-settings/ClientConnectionSettingsForm';

interface AuthTabFormData {
  username: string;
  password: string;
  isAdmin: boolean;
}

class AuthTab extends SettingsTab {
  state = {
    addUserError: null,
    hasFetchedUserList: false,
    isAddingUser: false,
  };

  formData?: Partial<AuthTabFormData>;

  formRef?: Form | null = null;

  settingsFormRef: React.RefObject<ClientConnectionSettingsFormType> = React.createRef();

  componentDidMount() {
    if (!this.props.isAdmin) return;

    AuthActions.fetchUsers().then(() => {
      this.setState({hasFetchedUserList: true});
    });
  }

  getUserList() {
    const userList = this.props.users.sort((a: Credentials, b: Credentials) => a.username.localeCompare(b.username));

    const currentUsername = AuthStore.getCurrentUsername();

    return userList.map((user: Credentials) => {
      const isCurrentUser = user.username === currentUsername;
      let badge = null;
      let removeIcon = null;

      if (!isCurrentUser) {
        removeIcon = (
          <span
            className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
            onClick={AuthTab.handleDeleteUserClick.bind(this, user.username)}>
            <Close />
          </span>
        );
      } else {
        badge = (
          <span className="interactive-list__label__tag tag">
            <FormattedMessage id="auth.current.user" />
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

  static handleDeleteUserClick(username: string) {
    AuthActions.deleteUser(username).then(AuthActions.fetchUsers);
  }

  handleFormChange = ({formData}: {formData: Record<string, unknown>}) => {
    this.formData = formData as Partial<AuthTabFormData>;
  };

  handleFormSubmit = () => {
    if (this.formData == null || this.settingsFormRef.current == null) {
      return;
    }

    if (this.formData.username == null || this.formData.username === '') {
      this.setState({
        addUserError: this.props.intl.formatMessage({
          id: 'auth.error.username.empty',
        }),
      });
    } else if (this.formData.password == null || this.formData.password === '') {
      this.setState({
        addUserError: this.props.intl.formatMessage({
          id: 'auth.error.password.empty',
        }),
      });
    } else {
      this.setState({isAddingUser: true});

      const connectionSettings = this.settingsFormRef.current.getConnectionSettings();
      if (connectionSettings == null) {
        this.setState({
          addUserError: this.props.intl.formatMessage({
            id: 'connection.settings.error.empty',
          }),
          isAddingUser: false,
        });
        return;
      }

      AuthActions.createUser({
        username: this.formData.username,
        password: this.formData.password,
        client: connectionSettings,
        level: this.formData.isAdmin === true ? AccessLevel.ADMINISTRATOR : AccessLevel.USER,
      })
        .then(AuthActions.fetchUsers, (error) => {
          this.setState({addUserError: error.response.data.message, isAddingUser: false});
        })
        .then(() => {
          if (this.formRef != null) {
            this.formRef.resetForm();
          }
          this.setState({addUserError: null, isAddingUser: false});
        });
    }
  };

  render() {
    if (!this.props.isAdmin) {
      return (
        <Form>
          <ModalFormSectionHeader>
            <FormattedMessage id="auth.user.accounts" />
          </ModalFormSectionHeader>
          <FormRow>
            <FormError>
              <FormattedMessage id="auth.message.not.admin" />
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
        <CSSTransition classNames="interactive-list__loading-indicator" timeout={{enter: 250, exit: 250}}>
          <div className="interactive-list__loading-indicator" key="loading-indicator">
            <LoadingRing />
          </div>
        </CSSTransition>
      );
    }

    return (
      <Form
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={(ref) => {
          this.formRef = ref;
        }}>
        <ModalFormSectionHeader>
          <FormattedMessage id="auth.user.accounts" />
        </ModalFormSectionHeader>
        <FormRow>
          <FormRowItem>
            <ul className={interactiveListClasses}>
              <TransitionGroup>{loadingIndicator}</TransitionGroup>
              {this.getUserList()}
            </ul>
          </FormRowItem>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="auth.add.user" />
        </ModalFormSectionHeader>
        {errorElement}
        <FormRow>
          <Textbox
            id="username"
            label={<FormattedMessage id="auth.username" />}
            placeholder={this.props.intl.formatMessage({
              id: 'auth.username',
            })}
            autoComplete="username"
          />
          <Textbox
            id="password"
            label={<FormattedMessage id="auth.password" />}
            placeholder={this.props.intl.formatMessage({
              id: 'auth.password',
            })}
            autoComplete="new-password"
          />
          <Checkbox grow={false} id="isAdmin" labelOffset matchTextboxHeight>
            <FormattedMessage id="auth.admin" />
          </Checkbox>
        </FormRow>
        <ClientConnectionSettingsForm ref={this.settingsFormRef} />
        <p />
        <FormRow justify="end">
          <Button isLoading={this.state.isAddingUser} priority="primary" type="submit">
            <FormattedMessage id="button.add" />
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
      event: 'AUTH_LIST_USERS_SUCCESS',
      getValue: () => {
        return {
          users: AuthStore.getUsers(),
          isAdmin: AuthStore.isAdmin(),
        };
      },
    },
  ];
});

export default ConnectedAuthTab;
