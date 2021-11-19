import {FC, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';
import {useNavigate} from 'react-router';

import {Button, Form, FormError, FormRow, Panel, PanelContent, PanelHeader, PanelFooter, Textbox} from '@client/ui';
import AuthActions from '@client/actions/AuthActions';

import {AccessLevel} from '@shared/schema/constants/Auth';

import type {Credentials} from '@shared/schema/Auth';
import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import ClientConnectionSettingsForm from '../general/connection-settings/ClientConnectionSettingsForm';

type LoginFormData = Pick<Credentials, 'username' | 'password'>;
type RegisterFormData = Pick<Credentials, 'username' | 'password'>;

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm: FC<AuthFormProps> = ({mode}: AuthFormProps) => {
  const {i18n} = useLingui();
  const formRef = useRef<Form>(null);
  const clientConnectionSettingsRef = useRef<ClientConnectionSettings | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | {id: string} | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

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
                  navigate('/overview', {replace: true});
                })
                .catch((error: Error) => {
                  setIsSubmitting(false);
                  setErrorMessage(error.message);
                  navigate('/login', {replace: true});
                });
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
                  navigate('/overview', {replace: true});
                },
                (error: Error) => {
                  setIsSubmitting(false);
                  setErrorMessage(error.message);
                },
              );
            }
          }}
          ref={formRef}
        >
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
              <Textbox placeholder={i18n._('auth.username')} id="username" autoComplete="username" />
            </FormRow>
            <FormRow>
              <Textbox
                placeholder={i18n._('auth.password')}
                id="password"
                type="password"
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
                }}
              >
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
