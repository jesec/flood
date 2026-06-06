import {FC} from 'react';

import ApplicationView, {ApplicationViewModifier} from '@client/components/layout/ApplicationView';
import AuthForm from '@client/components/auth/AuthForm';

const LoginView: FC = () => (
  <ApplicationView modifier={ApplicationViewModifier.AuthForm}>
    <AuthForm mode="login" />
  </ApplicationView>
);

export default LoginView;
