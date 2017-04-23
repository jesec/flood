import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../layout/ApplicationView';
import AuthForm from '../auth/AuthForm';

export default class LoginView extends React.Component {
  render() {
    return (
      <ApplicationView modifier="auth-form">
        <AuthForm mode="login" />
      </ApplicationView>
    );
  }
}
