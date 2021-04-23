import {FC, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';

import {Button, Form, FormError, FormRow, Panel, PanelContent, PanelHeader, PanelFooter, Textbox} from '@client/ui';
import AuthActions from '@client/actions/AuthActions';
import history from '@client/util/history';

import {AccessLevel} from '@shared/schema/constants/Auth';

import type {Credentials} from '@shared/schema/Auth';
import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import ClientConnectionSettingsForm from '../general/connection-settings/ClientConnectionSettingsForm';
import AuthStore from '@client/stores/AuthStore';

type LoginFormData = Pick<Credentials, 'username' | 'password'>;
type RegisterFormData = Pick<Credentials, 'username' | 'password'>;

interface AuthFormProps {
  mode: 'login' | 'register';
  hasHTTPBasicAuth: boolean;
}

const AuthForm: FC<AuthFormProps> = ({mode, hasHTTPBasicAuth}: AuthFormProps) => {
  const {i18n} = useLingui();
  const formRef = useRef<Form>(null);
  const clientConnectionSettingsRef = useRef<ClientConnectionSettings | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | {id: string} | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isLoginMode = mode === 'login';
  const isAutoLogin = hasHTTPBasicAuth;

  let submitLoginForm = (credentials: Pick<Credentials, 'username' | 'password'>) => {
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

  }

  const httpAuthCredentials = {
    username: AuthStore.getHTTPAuthUsername(),
    password: AuthStore.getHTTPAuthPassword(),
  }

  if (isAutoLogin && isLoginMode) {
    submitLoginForm(httpAuthCredentials)
  }

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
              submitLoginForm(credentials)
            } else {
              const config = formData as RegisterFormData;

              if (clientConnectionSettingsRef.current == null) {
                setIsSubmitting(false);
                setErrorMessage({id: 'connection.settings.error.empty'});
                return;
              }

              const connectionSettings = clientConnectionSettingsRef.current;
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
            <h1>{isLoginMode ? i18n._('auth.login') : i18n._('auth.create.an.account')}</h1>
          </PanelHeader>
          <PanelContent>
            <p className="copy--lead">
              {isLoginMode ? i18n._('auth.login.intro') : i18n._('auth.create.an.account.intro')}
            </p>
            {errorMessage != null ? (
              <FormRow>
                <FormError isLoading={isSubmitting}>
                  {typeof errorMessage === 'string' ? errorMessage : i18n._(errorMessage)}
                </FormError>
              </FormRow>
            ) : null}
            <FormRow>
              <Textbox
                placeholder="Username"
                id="username"
                defaultValue={isAutoLogin ? httpAuthCredentials.username : ''}
                disabled={isAutoLogin}
                autoComplete="username"
              />
            </FormRow>
            <FormRow>
              <Textbox
                placeholder="Password"
                id="password"
                type="password"
                defaultValue={isAutoLogin ? httpAuthCredentials.password : ''}
                disabled={isAutoLogin}
                autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              />
            </FormRow>
          </PanelContent>
          {isLoginMode ? null : (
            <PanelContent hasBorder>
              <ClientConnectionSettingsForm
                onSettingsChange={(settings) => {
                  clientConnectionSettingsRef.current = settings;
                }}
              />
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
                {i18n._('auth.input.clear')}
              </Button>
              <Button isLoading={isSubmitting} type="submit">
                {isLoginMode ? i18n._('auth.log.in') : i18n._('auth.create.account')}
              </Button>
            </FormRow>
          </PanelFooter>
        </Form>
      </Panel>
    </div>
  );
};

export default AuthForm;
