import type {AuthAuthenticationResponse, AuthVerificationResponse, Credentials} from '@shared/types/Auth';

import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ConfigStore from './ConfigStore';
import FloodActions from '../actions/FloodActions';

class AuthStoreClass extends BaseStore {
  isAuthenticating = false;
  isAuthenticated = false;
  token: string | null | undefined = null;
  users: Array<Credentials> = [];
  optimisticUsers: Array<Credentials> = [];
  currentUser: {
    isAdmin: boolean;
    isInitialUser: boolean;
    username: string | null;
  } = {
    isAdmin: false,
    isInitialUser: false,
    username: null,
  };

  addOptimisticUser(credentials: Credentials): void {
    this.optimisticUsers.push({username: credentials.username});
    this.emit('AUTH_LIST_USERS_SUCCESS');
  }

  getCurrentUsername(): this['currentUser']['username'] {
    return this.currentUser.username;
  }

  isAdmin(): this['currentUser']['isAdmin'] {
    return this.currentUser.isAdmin;
  }

  getIsAuthenticating(): this['isAuthenticating'] {
    return this.isAuthenticating;
  }

  getIsAuthenticated(): this['isAuthenticated'] {
    return this.isAuthenticated;
  }

  getIsInitialUser(): this['currentUser']['isInitialUser'] {
    return this.currentUser.isInitialUser;
  }

  getToken(): this['token'] {
    return this.token;
  }

  getUsers(): this['users'] {
    return this.users;
  }

  handleCreateUserSuccess(credentials: Credentials): void {
    this.addOptimisticUser(credentials);
    this.emit('AUTH_CREATE_USER_SUCCESS');
  }

  handleDeleteUserError(error?: Error & Partial<Pick<Credentials, 'username'>>): void {
    this.emit('AUTH_DELETE_USER_ERROR', error != null ? error.username : error);
  }

  handleDeleteUserSuccess(credentials: Credentials): void {
    this.emit('AUTH_DELETE_USER_SUCCESS', credentials.username);
  }

  handleListUsersSuccess(nextUserList: Array<Credentials>): void {
    this.optimisticUsers = this.optimisticUsers.filter(
      (optimisticUser) => !nextUserList.some((databaseUser) => databaseUser.username === optimisticUser.username),
    );
    this.users = nextUserList;
    this.emit('AUTH_LIST_USERS_SUCCESS');
  }

  handleLoginSuccess(response: AuthAuthenticationResponse): void {
    this.currentUser.username = response.username;
    this.currentUser.isAdmin = response.isAdmin;
    this.currentUser.isInitialUser = false;
    this.token = response.token;
    this.isAuthenticating = true;
    this.isAuthenticated = true;

    this.emit('AUTH_LOGIN_SUCCESS');
  }

  handleLoginError(error?: Error): void {
    this.token = null;
    this.isAuthenticated = false;
    this.isAuthenticating = true;
    this.emit('AUTH_LOGIN_ERROR', error);
  }

  handleRegisterSuccess(response: AuthAuthenticationResponse): void {
    this.currentUser.username = response.username;
    this.currentUser.isAdmin = response.isAdmin;
    this.currentUser.isInitialUser = false;
    this.emit('AUTH_REGISTER_SUCCESS', response);
    FloodActions.restartActivityStream();
  }

  handleRegisterError(error?: Error): void {
    this.emit('AUTH_REGISTER_ERROR', error);
  }

  handleAuthVerificationSuccess(response: AuthVerificationResponse): void {
    this.currentUser = {
      username: response.username,
      isAdmin: response.isAdmin,
      isInitialUser: response.initialUser,
    };

    if (response.token != null) {
      // Auth is disabled if a token is sent on verification
      ConfigStore.setDisableAuth(true);
      this.currentUser.isInitialUser = false;
    }

    this.isAuthenticating = true;
    this.isAuthenticated = !this.currentUser.isInitialUser;
    this.emit('AUTH_VERIFY_SUCCESS', response);
  }

  handleAuthVerificationError(error?: Error): void {
    this.isAuthenticated = false;
    this.isAuthenticating = true;
    this.currentUser.isInitialUser = false;
    this.emit('AUTH_VERIFY_ERROR', error);
  }
}

const AuthStore = new AuthStoreClass();

AuthStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case 'AUTH_LOGIN_SUCCESS':
      AuthStore.handleLoginSuccess(action.data);
      break;
    case 'AUTH_LOGIN_ERROR':
      AuthStore.handleLoginError(action.error);
      break;
    case 'AUTH_LIST_USERS_SUCCESS':
      AuthStore.handleListUsersSuccess(action.data as Array<Credentials>);
      break;
    case 'AUTH_CREATE_USER_SUCCESS':
      AuthStore.handleCreateUserSuccess(action.data as Credentials);
      break;
    case 'AUTH_DELETE_USER_SUCCESS':
      AuthStore.handleDeleteUserSuccess(action.data as Credentials);
      break;
    case 'AUTH_DELETE_USER_ERROR':
      AuthStore.handleDeleteUserError(action.error);
      break;
    case 'AUTH_REGISTER_SUCCESS':
      AuthStore.handleRegisterSuccess(action.data);
      break;
    case 'AUTH_REGISTER_ERROR':
      AuthStore.handleRegisterError(action.error);
      break;
    case 'AUTH_VERIFY_SUCCESS':
      AuthStore.handleAuthVerificationSuccess(action.data);
      break;
    case 'AUTH_VERIFY_ERROR':
      AuthStore.handleAuthVerificationError(action.error);
      break;
    default:
      break;
  }
});

export default AuthStore;
