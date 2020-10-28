import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {AccessLevel} from '@shared/schema/constants/Auth';

import type {Credentials} from '@shared/schema/Auth';

import {Button, Form, FormError, FormRow, Panel, PanelContent, PanelHeader, PanelFooter, Textbox} from '../../ui';
import AuthActions from '../../actions/AuthActions';
import ClientConnectionSettingsForm from '../general/connection-settings/ClientConnectionSettingsForm';
import history from '../../util/history';

import type {ClientConnectionSettingsFormType} from '../general/connection-settings/ClientConnectionSettingsForm';

type LoginFormData = Pick<Credentials, 'username' | 'password'>;
type RegisterFormData = Pick<Credentials, 'username' | 'password'>;

interface AuthFormProps extends WrappedComponentProps {
  mode: 'login' | 'register';
}

interface AuthFormStates {
  isSubmitting: boolean;
  errorMessage?: string;
}

class AuthForm extends React.Component<AuthFormProps, AuthFormStates> {
  formRef?: Form | null;
  settingsFormRef: React.RefObject<ClientConnectionSettingsFormType> = React.createRef();

  constructor(props: AuthFormProps) {
    super(props);
    this.state = {
      isSubmitting: false,
    };
  }

  getHeaderText() {
    const {mode, intl} = this.props;

    if (mode === 'login') {
      return intl.formatMessage({
        id: 'auth.login',
      });
    }

    return intl.formatMessage({
      id: 'auth.create.an.account',
    });
  }

  getIntroText() {
    const {mode, intl} = this.props;

    if (mode === 'login') {
      return intl.formatMessage({
        id: 'auth.login.intro',
      });
    }

    return intl.formatMessage({
      id: 'auth.create.an.account.intro',
    });
  }

  handleFormSubmit = (submission: {
    event: Event | React.FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => {
    submission.event.preventDefault();

    this.setState({isSubmitting: true});

    const {intl, mode} = this.props;

    const formData = submission.formData as Partial<LoginFormData> | Partial<RegisterFormData>;

    if (formData.username == null || formData.username === '') {
      this.setState({isSubmitting: false, errorMessage: intl.formatMessage({id: 'auth.error.username.empty'})});
      return;
    }

    if (formData.password == null || formData.password === '') {
      this.setState({isSubmitting: false, errorMessage: intl.formatMessage({id: 'auth.error.password.empty'})});
      return;
    }

    if (mode === 'login') {
      const credentials = formData as LoginFormData;

      AuthActions.authenticate({
        username: credentials.username,
        password: credentials.password,
      })
        .then(() => {
          this.setState({isSubmitting: false}, () => history.replace('overview'));
        })
        .catch((error: Error) => {
          this.setState({isSubmitting: false, errorMessage: error.message}, () => history.replace('login'));
        });
    } else {
      const config = formData as RegisterFormData;

      if (this.settingsFormRef.current == null) {
        this.setState({isSubmitting: false, errorMessage: intl.formatMessage({id: 'connection.settings.error.empty'})});
        return;
      }

      const connectionSettings = this.settingsFormRef.current.getConnectionSettings();
      if (connectionSettings == null) {
        this.setState({isSubmitting: false, errorMessage: intl.formatMessage({id: 'connection.settings.error.empty'})});
        return;
      }

      AuthActions.register({
        username: config.username,
        password: config.password,
        client: connectionSettings,
        level: AccessLevel.ADMINISTRATOR,
      }).then(
        () => {
          this.setState({isSubmitting: false}, () => history.replace('overview'));
        },
        (error: Error) => {
          this.setState({isSubmitting: false, errorMessage: error.message});
        },
      );
    }
  };

  render() {
    const {errorMessage, isSubmitting} = this.state;
    const {intl, mode} = this.props;
    const isLoginMode = mode === 'login';

    return (
      <div className="application__entry-barrier">
        <Panel spacing="large">
          <Form
            onSubmit={this.handleFormSubmit}
            ref={(ref) => {
              this.formRef = ref;
            }}>
            <PanelHeader>
              <h1>{this.getHeaderText()}</h1>
            </PanelHeader>
            <PanelContent>
              <p className="copy--lead">{this.getIntroText()}</p>
              {errorMessage != null ? (
                <FormRow>
                  <FormError isLoading={isSubmitting}>{errorMessage}</FormError>
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
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </FormRow>
            </PanelContent>
            {isLoginMode ? null : (
              <PanelContent hasBorder>
                <ClientConnectionSettingsForm ref={this.settingsFormRef} />
              </PanelContent>
            )}
            <PanelFooter hasBorder>
              <FormRow justify="end">
                <Button
                  priority="tertiary"
                  onClick={() => {
                    if (this.formRef != null) {
                      this.formRef.resetForm();
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
  }
}

export default injectIntl(AuthForm);
