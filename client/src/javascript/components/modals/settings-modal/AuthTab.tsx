import classnames from 'classnames';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FC, useEffect, useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {observer} from 'mobx-react';

import {Button, Checkbox, Form, FormError, FormRowItem, FormRow, LoadingRing, Textbox} from '@client/ui';
import {Close} from '@client/ui/icons';
import AuthActions from '@client/actions/AuthActions';
import AuthStore from '@client/stores/AuthStore';

import {AccessLevel} from '@shared/schema/constants/Auth';

import type {Credentials} from '@shared/schema/Auth';
import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import ClientConnectionSettingsForm from '../../general/connection-settings/ClientConnectionSettingsForm';
import ModalFormSectionHeader from '../ModalFormSectionHeader';

interface AuthTabFormData {
  username: string;
  password: string;
  isAdmin: boolean;
}

const AuthTab: FC = observer(() => {
  const formRef = useRef<Form>(null);
  const clientConnectionSettingsRef = useRef<ClientConnectionSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUserListFetched, setIsUserListFetched] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const intl = useIntl();

  useEffect(() => {
    if (AuthStore.currentUser.isAdmin) {
      AuthActions.fetchUsers().then(() => {
        setIsUserListFetched(true);
      });
    }
  }, []);

  if (!AuthStore.currentUser.isAdmin) {
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

  const isLoading = !isUserListFetched && AuthStore.users.length === 0;
  const interactiveListClasses = classnames('interactive-list', {
    'interactive-list--loading': isLoading,
  });

  return (
    <Form
      onSubmit={() => {
        if (formRef.current == null || clientConnectionSettingsRef.current == null) {
          return;
        }

        const formData = formRef.current.getFormData() as Partial<AuthTabFormData>;

        if (formData.username == null || formData.username === '') {
          setError('auth.error.username.empty');
        } else if (formData.password == null || formData.password === '') {
          setError('auth.error.password.empty');
        } else {
          setIsSubmitting(true);

          const connectionSettings = clientConnectionSettingsRef.current;
          if (connectionSettings == null) {
            setError('connection.settings.error.empty');
            setIsSubmitting(false);
            return;
          }

          AuthActions.createUser({
            username: formData.username,
            password: formData.password,
            client: connectionSettings,
            level: formData.isAdmin === true ? AccessLevel.ADMINISTRATOR : AccessLevel.USER,
          })
            .then(
              () => {
                if (formRef.current != null) {
                  formRef.current.resetForm();
                }
                setError(null);
                setIsSubmitting(false);
              },
              () => {
                setError('general.error.unknown');
                setIsSubmitting(false);
              },
            )
            .then(AuthActions.fetchUsers);
        }
      }}
      ref={formRef}>
      <ModalFormSectionHeader>
        <FormattedMessage id="auth.user.accounts" />
      </ModalFormSectionHeader>
      <FormRow>
        <FormRowItem>
          <ul className={interactiveListClasses}>
            <TransitionGroup>
              {isLoading && (
                <CSSTransition classNames="interactive-list__loading-indicator" timeout={{enter: 250, exit: 250}}>
                  <div className="interactive-list__loading-indicator" key="loading-indicator">
                    <LoadingRing />
                  </div>
                </CSSTransition>
              )}
            </TransitionGroup>
            {AuthStore.users
              .slice()
              .sort((a: Credentials, b: Credentials) => a.username.localeCompare(b.username))
              .map((user: Credentials) => {
                const isCurrentUser = user.username === AuthStore.currentUser.username;
                let badge = null;
                let removeIcon = null;

                if (!isCurrentUser) {
                  removeIcon = (
                    <span
                      className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
                      onClick={() => AuthActions.deleteUser(user.username).then(AuthActions.fetchUsers)}>
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
              })}
          </ul>
        </FormRowItem>
      </FormRow>
      <ModalFormSectionHeader>
        <FormattedMessage id="auth.add.user" />
      </ModalFormSectionHeader>
      {error && (
        <FormRow>
          <FormError>{intl.formatMessage({id: error})}</FormError>
        </FormRow>
      )}
      <FormRow>
        <Textbox
          id="username"
          label={<FormattedMessage id="auth.username" />}
          placeholder={intl.formatMessage({
            id: 'auth.username',
          })}
          autoComplete="username"
        />
        <Textbox
          id="password"
          label={<FormattedMessage id="auth.password" />}
          placeholder={intl.formatMessage({
            id: 'auth.password',
          })}
          autoComplete="new-password"
        />
        <Checkbox grow={false} id="isAdmin" labelOffset matchTextboxHeight>
          <FormattedMessage id="auth.admin" />
        </Checkbox>
      </FormRow>
      <ClientConnectionSettingsForm
        onSettingsChange={(settings) => {
          clientConnectionSettingsRef.current = settings;
        }}
      />
      <p />
      <FormRow justify="end">
        <Button isLoading={isSubmitting} priority="primary" type="submit">
          <FormattedMessage id="button.add" />
        </Button>
      </FormRow>
    </Form>
  );
});

export default AuthTab;
