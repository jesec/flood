import ApplicationView from '../layout/ApplicationView';
import AuthForm from '../auth/AuthForm';

const LoginView = () => {
  return (
    <ApplicationView modifier="auth-form">
      <AuthForm mode="login" />
    </ApplicationView>
  );
};

export default LoginView;
