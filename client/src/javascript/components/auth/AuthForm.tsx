import {FC, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import {Button, Form, FormError, FormRow, Panel, PanelContent, PanelHeader, PanelFooter, Textbox} from '@client/ui';
import AuthActions from '@client/actions/AuthActions';
import history from '@client/util/history';

import {AccessLevel} from '@shared/schema/constants/Auth';

import type {Credentials} from '@shared/schema/Auth';

import ClientConnectionSettingsForm from '../general/connection-settings/ClientConnectionSettingsForm';

import type {ClientConnectionSettingsFormType} from '../general/connection-settings/ClientConnectionSettingsForm';

type LoginFormData = Pick<Credentials, 'username' | 'password'>;
type RegisterFormData = Pick<Credentials, 'username' | 'password'>;

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm: FC<AuthFormProps> = ({mode}: AuthFormProps) => {
  const intl = useIntl();
  const formRef = useRef<Form>(null);
  const settingsFormRef = useRef<ClientConnectionSettingsFormType>(null);
  const [errorMessage, setErrorMessage] = useState<string | {id: string} | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isLoginMode = mode === 'login';

  return (
    <div className="application__entry-barrier">
      <Panel spacing="large">
        <Form
          onSubmit={(submission) => {
            submission.event.preventDefault();

            setIsSubmitting(true);

            const formData = submission.formData as Partial<LoginFormData> | Partial<RegisterFormData>;

            if (formData.username == null || formData.username === '') {
              setIsSubmitting(false);
              setErrorMessage({id: 'auth.error.username.empty'});
              return;
            }

            if (formData.password == null || formData.password === '') {
              setIsSubmitting(false);
              setErrorMessage({id: 'auth.error.password.empty'});
              return;
            }

            if (isLoginMode) {
              const credentials = formData as LoginFormData;

              AuthActions.authenticate({
                username: credentials.username,
                password: credentials.password,
              })
                .then(() => {
                  setIsSubmitting(false);
                  history.replace('overview');
                })
                .catch((error: Error) => {
                  setIsSubmitting(false);
                  setErrorMessage(error.message);
                  history.replace('login');
                });
            } else {
              const config = formData as RegisterFormData;

              if (settingsFormRef.current == null) {
                setIsSubmitting(false);
                setErrorMessage({id: 'connection.settings.error.empty'});
                return;
              }

              const connectionSettings = settingsFormRef.current.getConnectionSettings();
              if (connectionSettings == null) {
                setIsSubmitting(false);
                setErrorMessage({id: 'connection.settings.error.empty'});
                return;
              }

              AuthActions.register({
                username: config.username,
                password: config.password,
                client: connectionSettings,
                level: AccessLevel.ADMINISTRATOR,
              }).then(
                () => {
                  setIsSubmitting(false);
                  history.replace('overview');
                },
                (error: Error) => {
                  setIsSubmitting(false);
                  setErrorMessage(error.message);
                },
              );
            }
          }}
          ref={formRef}>
          <PanelHeader>
            <h1>
              {isLoginMode
                ? intl.formatMessage({
                    id: 'auth.login',
                  })
                : intl.formatMessage({
                    id: 'auth.create.an.account',
                  })}
            </h1>
          </PanelHeader>
          <PanelContent>
            <p className="copy--lead">
              {isLoginMode
                ? intl.formatMessage({
                    id: 'auth.login.intro',
                  })
                : intl.formatMessage({
                    id: 'auth.create.an.account.intro',
                  })}
            </p>
            {errorMessage != null ? (
              <FormRow>
                <FormError isLoading={isSubmitting}>
                  {typeof errorMessage === 'string' ? errorMessage : intl.formatMessage(errorMessage)}
                </FormError>
              </FormRow>
            ) : null}
            <FormRow>
              <Textbox placeholder="Username" id="username" autoComplete="username" />
            </FormRow>
            <FormRow>
              <Textbox
                placeholder="Password"
                id="password"
                type="password"
                autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              />
            </FormRow>
          </PanelContent>
          {isLoginMode ? null : (
            <PanelContent hasBorder>
              <ClientConnectionSettingsForm ref={settingsFormRef} />
            </PanelContent>
          )}
          <PanelFooter hasBorder>
            <FormRow justify="end">
              <Button
                priority="tertiary"
                onClick={() => {
                  if (formRef.current != null) {
                    formRef.current.resetForm();
                  }
                }}>
                {intl.formatMessage({
                  id: 'auth.input.clear',
                })}
              </Button>
              <Button isLoading={isSubmitting} type="submit">
                {isLoginMode
                  ? intl.formatMessage({
                      id: 'auth.log.in',
                    })
                  : intl.formatMessage({
                      id: 'auth.create.account',
                    })}
              </Button>
            </FormRow>
          </PanelFooter>
        </Form>
      </Panel>
    </div>
  );
};

export default AuthForm;
