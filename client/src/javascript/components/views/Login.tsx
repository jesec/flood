import React from 'react';

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
