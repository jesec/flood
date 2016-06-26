import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../components/layout/ApplicationView';
import RegistrationForm from '../components/auth/RegistrationForm';

export default class LoginView extends React.Component {
  render() {
    return (
      <ApplicationView>
        <RegistrationForm />
      </ApplicationView>
    );
  }
}
