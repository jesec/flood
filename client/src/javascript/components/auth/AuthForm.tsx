import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Button, Form, FormError, FormRow, Panel, PanelContent, PanelHeader, PanelFooter, Textbox} from '../../ui';
import AuthActions from '../../actions/AuthActions';
import AuthStore from '../../stores/AuthStore';
import connectStores from '../../util/connectStores';
import history from '../../util/history';
import RTorrentConnectionTypeSelection from '../general/RTorrentConnectionTypeSelection';

import type {Credentials, UserConfig} from '../../stores/AuthStore';

interface AuthFormProps extends WrappedComponentProps {
  mode: 'login' | 'register';
  error?: Error;
}

interface AuthFormStates {
  isSubmitting: boolean;
}

class AuthForm extends React.Component<AuthFormProps, AuthFormStates> {
  formRef?: Form | null;

  constructor(props: AuthFormProps) {
    super(props);
    this.state = {
      isSubmitting: false,
    };
  }

  getHeaderText() {
    if (this.props.mode === 'login') {
      return this.props.intl.formatMessage({
        id: 'auth.login',
      });
    }

    return this.props.intl.formatMessage({
      id: 'auth.create.an.account',
    });
  }

  getIntroText() {
    if (this.props.mode === 'login') {
      return this.props.intl.formatMessage({
        id: 'auth.login.intro',
      });
    }

    return this.props.intl.formatMessage({
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
      const credentials = submission.formData as Partial<Credentials>;

      if (credentials.username == null || credentials.username === '') {
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
      const config = submission.formData as Partial<UserConfig>;

      if (config.username == null || config.username === '') {
        this.setState({isSubmitting: false}, () => {
          // do nothing.
        });
        return;
      }

      AuthActions.register({
        username: config.username,
        password: config.password,
        host: config.rtorrentHost,
        port: config.rtorrentPort,
        socketPath: config.rtorrentSocketPath,
        isAdmin: true,
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
                <Textbox placeholder="Username" id="username" />
              </FormRow>
              <FormRow>
                <Textbox placeholder="Passsword" id="password" type="password" />
              </FormRow>
            </PanelContent>
            {isLoginMode ? null : (
              <PanelContent hasBorder>
                <RTorrentConnectionTypeSelection />
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
                <Button isLoading={this.state.isSubmitting} type="submit">
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
