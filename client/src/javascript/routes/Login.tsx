import {FC} from 'react';

import ApplicationView from '@client/components/layout/ApplicationView';
import AuthForm from '@client/components/auth/AuthForm';

const LoginView: FC = () => (
  <ApplicationView modifier="auth-form">
    <AuthForm mode="login" />
  </ApplicationView>
);

export default LoginView;
