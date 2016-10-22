import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../components/Layout/ApplicationView';
import RegistrationForm from '../components/Auth/RegistrationForm';

export default class LoginView extends React.Component {
  render() {
    return (
      <ApplicationView modifier="auth-form">
        <RegistrationForm />
      </ApplicationView>
    );
  }
}
