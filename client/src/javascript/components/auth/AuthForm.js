import {injectIntl} from 'react-intl';
import React from 'react';

import AuthStore from '../../stores/AuthStore';
import EventTypes from '../../constants/EventTypes';

import {
  Button,
  Form,
  FormError,
  FormRow,
  Panel,
  PanelContent,
  PanelHeader,
  PanelFooter,
  Textbox
} from 'flood-ui-kit';

const METHODS_TO_BIND = ['handleAuthError', 'handleFormSubmit'];

class AuthForm extends React.Component {
  constructor() {
    super();

    this.state = {
      error: null,
      isAuthStatusLoading: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    AuthStore.listen(EventTypes.AUTH_LOGIN_ERROR, this.handleAuthError);
    AuthStore.listen(EventTypes.AUTH_REGISTER_ERROR, this.handleAuthError);
  }

  componentWillUnmount() {
    AuthStore.unlisten(EventTypes.AUTH_LOGIN_ERROR, this.handleAuthError);
    AuthStore.unlisten(EventTypes.AUTH_REGISTER_ERROR, this.handleAuthError);
  }

  getValue(fieldName) {
    return this.state[fieldName];
  }

  getHeaderText() {
    if (this.props.mode === 'login') {
      return this.props.intl.formatMessage({
        id: 'auth.login',
        defaultMessage: 'Login'
      });
    }

    return this.props.intl.formatMessage({
      id: 'auth.create.an.account',
      defaultMessage: 'Create an account'
    });
  }

  getIntroText() {
    if (this.props.mode === 'login') {
      return this.props.intl.formatMessage({
        id: 'auth.login.intro',
        defaultMessage: 'Log in to your account.'
      });
    }

    return this.props.intl.formatMessage({
      id: 'auth.create.an.account.intro',
      defaultMessage: 'Welcome to Flood! Create a username and strong password.'
    });
  }

  handleAuthError(error) {
    this.setState({isAuthStatusLoading: false, error});
  }

  handleFormSubmit(submission) {
    submission.event.preventDefault();

    this.setState({isAuthStatusLoading: true});

    if (this.props.mode === 'login') {
      AuthStore.authenticate({
        username: submission.formData.username,
        password: submission.formData.password
      });
    } else {
      AuthStore.register({
        username: submission.formData.username,
        password: submission.formData.password
      });
    }
  }

  render() {
    let actionText = null;
    let errorRow;

    if (this.props.mode === 'login') {
      actionText = this.props.intl.formatMessage({
        id: 'auth.log.in',
        defaultMessage: 'Log In'
      });
    } else {
      actionText = this.props.intl.formatMessage({
        id: 'auth.create.account',
        defaultMessage: 'Create Account'
      });
    }

    if (this.state.error) {
      errorRow = (
        <FormRow>
          <FormError isLoading={this.state.isAuthStatusLoading}>
            {this.state.error}
          </FormError>
        </FormRow>
      );
    }

    return (
      <div style={{width: 500}}>
        <Panel spacing="large">
          <Form onSubmit={this.handleFormSubmit}>
            <PanelHeader>
              <h1>{this.getHeaderText()}</h1>
            </PanelHeader>
            <PanelContent>
              <p>{this.getIntroText()}</p>
              {errorRow}
              <FormRow>
                <Textbox placeholder="Username" id="username" />
              </FormRow>
              <FormRow>
                <Textbox placeholder="Passsword" id="password" type="password" />
              </FormRow>
            </PanelContent>
            <PanelFooter>
              <FormRow justify="right">
                <Button children="Clear" priority="tertiary" type="reset" />
                <Button isLoading={this.state.isAuthStatusLoading} type="submit">
                  {actionText}
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
