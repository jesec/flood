import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../components/Layout/ApplicationView';
import LoginForm from '../components/Auth/LoginForm';

export default class LoginView extends React.Component {
  render() {
    return (
      <ApplicationView modifier="login">
        <LoginForm />
      </ApplicationView>
    );
  }
}
