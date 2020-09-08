import AppDispatcher from '../dispatcher/AppDispatcher';
import AuthActions from '../actions/AuthActions';
import BaseStore from './BaseStore';
import ConfigStore from './ConfigStore';
import FloodActions from '../actions/FloodActions';

export interface ConnectionSettings {
  connectionType?: 'socket' | 'tcp';
  rtorrentSocketPath?: string;
  rtorrentPort?: string;
  rtorrentHost?: string;
}

export interface Credentials {
  username: string;
  password?: string;
  host?: string;
  port?: string;
  socketPath?: string;
  isAdmin?: boolean;
  token?: string;
  initialUser?: boolean;
}

export type UserConfig = Credentials & ConnectionSettings;

class AuthStoreClass extends BaseStore {
  isAuthenticating = false;
  isAuthenticated = false;
  token: string | null | undefined = null;
  users: Array<Credentials> = [];
  optimisticUsers: Array<Credentials> = [];
  currentUser: {
    isAdmin: boolean | undefined;
    isInitialUser: boolean | undefined;
    username: string | null;
  } = {
    isAdmin: false,
    isInitialUser: false,
    username: null,
  };

  createUser(config: UserConfig) {
    AuthActions.createUser(config);
  }

  addOptimisticUser(credentials: Credentials) {
    this.optimisticUsers.push({username: credentials.username});
    this.emit('AUTH_LIST_USERS_SUCCESS');
  }

  getCurrentUsername() {
    return this.currentUser.username;
  }

  isAdmin() {
    return this.currentUser.isAdmin;
  }

  getIsAuthenticating() {
    return this.isAuthenticating;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getIsInitialUser() {
    return this.currentUser.isInitialUser;
  }

  getToken() {
    return this.token;
  }

  getUsers() {
    return this.users;
  }

  handleCreateUserSuccess(credentials: Credentials) {
    this.addOptimisticUser(credentials);
    this.emit('AUTH_CREATE_USER_SUCCESS');
  }

  handleDeleteUserError(error?: Error & Partial<Pick<Credentials, 'username'>>) {
    this.emit('AUTH_DELETE_USER_ERROR', error != null ? error.username : error);
  }

  handleDeleteUserSuccess(credentials: Credentials) {
    this.emit('AUTH_DELETE_USER_SUCCESS', credentials.username);
  }

  handleListUsersSuccess(nextUserList: Array<Credentials>) {
    this.optimisticUsers = this.optimisticUsers.filter(
      (optimisticUser) => !nextUserList.some((databaseUser) => databaseUser.username === optimisticUser.username),
    );
    this.users = nextUserList;
    this.emit('AUTH_LIST_USERS_SUCCESS');
  }

  handleLoginSuccess(credentials: Credentials) {
    this.currentUser.username = credentials.username;
    this.currentUser.isAdmin = credentials.isAdmin;
    this.currentUser.isInitialUser = false;
    this.token = credentials.token;
    this.isAuthenticating = true;
    this.isAuthenticated = true;

    this.emit('AUTH_LOGIN_SUCCESS');
  }

  handleLoginError(error?: Error) {
    this.token = null;
    this.isAuthenticated = false;
    this.isAuthenticating = true;
    this.emit('AUTH_LOGIN_ERROR', error);
  }

  handleRegisterSuccess(credentials: Credentials) {
    this.currentUser.username = credentials.username;
    this.currentUser.isAdmin = credentials.isAdmin;
    this.currentUser.isInitialUser = false;
    this.emit('AUTH_REGISTER_SUCCESS', credentials);
    FloodActions.restartActivityStream();
  }

  handleRegisterError(error?: Error) {
    this.emit('AUTH_REGISTER_ERROR', error);
  }

  handleAuthVerificationSuccess(credentials: Credentials) {
    if (credentials.token != null) {
      // Auth is disabled if a token is sent on verification
      ConfigStore.setDisableAuth(true);
      credentials.initialUser = false;
    }
    this.currentUser.username = credentials.username;
    this.currentUser.isAdmin = credentials.isAdmin;
    this.currentUser.isInitialUser = credentials.initialUser;
    this.isAuthenticating = true;
    this.isAuthenticated = !credentials.initialUser;
    this.emit('AUTH_VERIFY_SUCCESS', credentials);
  }

  handleAuthVerificationError(error?: Error) {
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
      AuthStore.handleLoginSuccess(action.data as Credentials);
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
      AuthStore.handleRegisterSuccess(action.data as Credentials);
      break;
    case 'AUTH_REGISTER_ERROR':
      AuthStore.handleRegisterError(action.error);
      break;
    case 'AUTH_VERIFY_SUCCESS':
      AuthStore.handleAuthVerificationSuccess(action.data as Credentials);
      break;
    case 'AUTH_VERIFY_ERROR':
      AuthStore.handleAuthVerificationError(action.error);
      break;
    default:
      break;
  }
});

export default AuthStore;
