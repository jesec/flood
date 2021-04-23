import {FC} from 'react';

import AuthForm from '@client/components/auth/AuthForm';
import ApplicationView from '@client/components/layout/ApplicationView';

const LoginView: FC = () => (
  <ApplicationView modifier="auth-form">
    <AuthForm hasHTTPBasicAuth={true} mode="register" />
  </ApplicationView>
);

export default LoginView;
