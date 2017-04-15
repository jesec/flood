import classnames from'classnames';
import React from'react';

import AuthForm from './AuthForm';

export default class RegistrationForm extends React.Component {
  render() {
    return <AuthForm mode="register" />;
  }
}
