import {browserHistory} from 'react-router';
import {injectIntl} from 'react-intl';
import React from 'react';

import {Button, Form, FormError, FormRow, Panel, PanelContent, PanelHeader, PanelFooter, Textbox} from 'flood-ui-kit';
import AuthActions from '../../actions/AuthActions';
import AuthStore from '../../stores/AuthStore';
import connectStores from '../../util/connectStores';
import EventTypes from '../../constants/EventTypes';
import RtorrentConnectionTypeSelection from '../general/RtorrentConnectionTypeSelection';

class AuthForm extends React.Component {
  state = {
    isSubmitting: false,
  };

  getHeaderText() {
    if (this.props.mode === 'login') {
      return this.props.intl.formatMessage({
        id: 'auth.login',
        defaultMessage: 'Login',
      });
    }

    return this.props.intl.formatMessage({
      id: 'auth.create.an.account',
      defaultMessage: 'Create an account',
    });
  }

  getIntroText() {
    if (this.props.mode === 'login') {
      return this.props.intl.formatMessage({
        id: 'auth.login.intro',
        defaultMessage: 'Log in to your account.',
      });
    }

    return this.props.intl.formatMessage({
      id: 'auth.create.an.account.intro',
      defaultMessage: 'Welcome to Flood! Create a username and strong password.',
    });
  }

  handleFormSubmit = submission => {
    submission.event.preventDefault();

    this.setState({isSubmitting: true});

    if (this.props.mode === 'login') {
      AuthActions.authenticate({
        username: submission.formData.username,
        password: submission.formData.password,
      })
        .then(() => {
          this.setState({isSubmitting: false}, () => browserHistory.replace('overview'));
        })
        .catch(() => {
          this.setState({isSubmitting: false}, () => browserHistory.replace('login'));
        });
    } else {
      AuthActions.register({
        username: submission.formData.username,
        password: submission.formData.password,
        host: submission.formData.rtorrentHost,
        port: submission.formData.rtorrentPort,
        socketPath: submission.formData.rtorrentSocketPath,
        isAdmin: true,
      }).then(() => {
        this.setState({isSubmitting: false}, () => browserHistory.replace('overview'));
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
            ref={ref => {
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
                <RtorrentConnectionTypeSelection />
              </PanelContent>
            )}
            <PanelFooter hasBorder>
              <FormRow justify="end">
                <Button priority="tertiary" onClick={() => this.formRef.resetForm()}>
                  Clear
                </Button>
                <Button isLoading={this.state.isSubmitting} type="submit">
                  {isLoginMode
                    ? intl.formatMessage({
                        id: 'auth.log.in',
                        defaultMessage: 'Log In',
                      })
                    : intl.formatMessage({
                        id: 'auth.create.account',
                        defaultMessage: 'Create Account',
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

const ConnectedAuthForm = connectStores(injectIntl(AuthForm), () => {
  return [
    {
      store: AuthStore,
      event: [EventTypes.AUTH_LOGIN_ERROR, EventTypes.AUTH_REGISTER_ERROR],
      getValue: ({payload}) => {
        return {
          error: payload,
        };
      },
    },
  ];
});

export default ConnectedAuthForm;
