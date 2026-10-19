import {FC} from 'react';

import AuthForm from '@client/components/auth/AuthForm';
import ApplicationView, {ApplicationViewModifier} from '@client/components/layout/ApplicationView';

const LoginView: FC = () => (
  <ApplicationView modifier={ApplicationViewModifier.AuthForm}>
    <AuthForm mode="register" />
  </ApplicationView>
);

export default LoginView;
