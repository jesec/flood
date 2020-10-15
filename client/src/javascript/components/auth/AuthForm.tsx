import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {AccessLevel} from '@shared/schema/Auth';

import type {Credentials} from '@shared/schema/Auth';

import {Button, Form, FormError, FormRow, Panel, PanelContent, PanelHeader, PanelFooter, Textbox} from '../../ui';
import AuthActions from '../../actions/AuthActions';
import AuthStore from '../../stores/AuthStore';
import ClientConnectionSettingsForm from '../general/connection-settings/ClientConnectionSettingsForm';
import connectStores from '../../util/connectStores';
import history from '../../util/history';

import type {ClientConnectionSettingsFormType} from '../general/connection-settings/ClientConnectionSettingsForm';

type LoginFormData = Pick<Credentials, 'username' | 'password'>;
type RegisterFormData = Pick<Credentials, 'username' | 'password'>;

interface AuthFormProps extends WrappedComponentProps {
  mode: 'login' | 'register';
  error?: Error;
}

interface AuthFormStates extends Record<string, unknown> {
  isSubmitting: boolean;
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

    if (this.props.mode === 'login') {
      const credentials = submission.formData as Partial<LoginFormData>;

      if (
        credentials.username == null ||
        credentials.username === '' ||
        credentials.password == null ||
        credentials.password === ''
      ) {
        this.setState({isSubmitting: false}, () => {
          // do nothing.
        });
        return;
      }

      AuthActions.authenticate({
        username: credentials.username,
        password: credentials.password,
      })
        .then(() => {
          this.setState({isSubmitting: false}, () => history.replace('overview'));
        })
        .catch(() => {
          this.setState({isSubmitting: false}, () => history.replace('login'));
        });
    } else {
      const config = submission.formData as Partial<RegisterFormData>;

      if (
        config.username == null ||
        config.username === '' ||
        config.password == null ||
        config.password === '' ||
        this.settingsFormRef.current == null
      ) {
        this.setState({isSubmitting: false});
        return;
      }

      const connectionSettings = this.settingsFormRef.current.getConnectionSettings();
      if (connectionSettings == null) {
        this.setState({isSubmitting: false});
        return;
      }

      AuthActions.register({
        username: config.username,
        password: config.password,
        client: connectionSettings,
        level: AccessLevel.ADMINISTRATOR,
      }).then(() => {
        this.setState({isSubmitting: false}, () => history.replace('overview'));
      });
    }
  };

  render() {
    const {isSubmitting} = this.state;
    const {error, intl, mode} = this.props;
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
              {error != null ? (
                <FormRow>
                  <FormError isLoading={isSubmitting}>{error}</FormError>
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
                  Clear
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

const ConnectedAuthForm = connectStores<Omit<AuthFormProps, 'intl'>, AuthFormStates>(injectIntl(AuthForm), () => {
  return [
    {
      store: AuthStore,
      event: ['AUTH_LOGIN_ERROR', 'AUTH_REGISTER_ERROR'],
      getValue: ({payload}) => {
        return {
          error: payload as AuthFormProps['error'],
        };
      },
    },
  ];
});

export default ConnectedAuthForm;
