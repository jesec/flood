import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../layout/ApplicationView';
import RegistrationForm from '../auth/RegistrationForm';

export default class LoginView extends React.Component {
  render() {
    return (
      <ApplicationView modifier="auth-form">
        <RegistrationForm />
      </ApplicationView>
    );
  }
}
