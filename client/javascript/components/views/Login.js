import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../layout/ApplicationView';
import LoginForm from '../auth/LoginForm';

export default class LoginView extends React.Component {
  render() {
    return (
      <ApplicationView modifier="auth-form">
        <LoginForm />
      </ApplicationView>
    );
  }
}
