import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../components/layout/ApplicationView';
import LoginForm from '../components/auth/LoginForm';

export default class LoginView extends React.Component {
  render() {
    return (
      <ApplicationView>
        <LoginForm />
      </ApplicationView>
    );
  }
}
