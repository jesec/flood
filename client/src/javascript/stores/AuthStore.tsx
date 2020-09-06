import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AuthActions from '../actions/AuthActions';
import BaseStore from './BaseStore';
import ConfigStore from './ConfigStore';
import FloodActions from '../actions/FloodActions';
import EventTypes from '../constants/EventTypes';

interface Credentials {
  username: string;
  password?: string;
  host?: string;
  port?: string;
  socketPath?: string;
  isAdmin?: boolean;
  token?: string;
  initialUser?: boolean;
}

class AuthStoreClass extends BaseStore {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  token: string | null | undefined;
  users: Array<Credentials>;
  optimisticUsers: Array<Credentials>;
  currentUser: {
    isAdmin: boolean | undefined;
    isInitialUser: boolean | undefined;
    username: string | null;
  };

  constructor() {
    super();
    this.isAuthenticating = false;
    this.isAuthenticated = false;
    this.token = null;
    this.users = [];
    this.optimisticUsers = [];
    this.currentUser = {
      isAdmin: false,
      isInitialUser: false,
      username: null,
    };
  }

  createUser(credentials: Credentials) {
    AuthActions.createUser(credentials);
  }

  addOptimisticUser(credentials: Credentials) {
    this.optimisticUsers.push({username: credentials.username});
    this.emit(EventTypes.AUTH_LIST_USERS_SUCCESS);
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
    this.emit(EventTypes.AUTH_CREATE_USER_SUCCESS);
  }

  handleDeleteUserError(credentials: Credentials) {
    this.emit(EventTypes.AUTH_DELETE_USER_ERROR, credentials.username);
  }

  handleDeleteUserSuccess(credentials: Credentials) {
    this.emit(EventTypes.AUTH_DELETE_USER_SUCCESS, credentials.username);
  }

  handleListUsersSuccess(nextUserList: Array<Credentials>) {
    this.optimisticUsers = this.optimisticUsers.filter(
      (optimisticUser) => !nextUserList.some((databaseUser) => databaseUser.username === optimisticUser.username),
    );
    this.users = nextUserList;
    this.emit(EventTypes.AUTH_LIST_USERS_SUCCESS);
  }

  handleLoginSuccess(credentials: Credentials) {
    this.currentUser.username = credentials.username;
    this.currentUser.isAdmin = credentials.isAdmin;
    this.currentUser.isInitialUser = false;
    this.token = credentials.token;
    this.isAuthenticating = true;
    this.isAuthenticated = true;

    this.emit(EventTypes.AUTH_LOGIN_SUCCESS);
  }

  handleLoginError(error: Error) {
    this.token = null;
    this.isAuthenticated = false;
    this.isAuthenticating = true;
    this.emit(EventTypes.AUTH_LOGIN_ERROR, error);
  }

  handleRegisterSuccess(credentials: Credentials) {
    this.currentUser.username = credentials.username;
    this.currentUser.isAdmin = credentials.isAdmin;
    this.currentUser.isInitialUser = false;
    this.emit(EventTypes.AUTH_REGISTER_SUCCESS, credentials);
    FloodActions.restartActivityStream();
  }

  handleRegisterError(error: Error) {
    this.emit(EventTypes.AUTH_REGISTER_ERROR, error);
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
    this.emit(EventTypes.AUTH_VERIFY_SUCCESS, credentials);
  }

  handleAuthVerificationError(error: Error) {
    this.isAuthenticated = false;
    this.isAuthenticating = true;
    this.currentUser.isInitialUser = false;
    this.emit(EventTypes.AUTH_VERIFY_ERROR, error);
  }
}

const AuthStore = new AuthStoreClass();

AuthStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case ActionTypes.AUTH_LOGIN_SUCCESS:
      AuthStore.handleLoginSuccess(action.data);
      break;
    case ActionTypes.AUTH_LOGIN_ERROR:
      AuthStore.handleLoginError(action.error);
      break;
    case ActionTypes.AUTH_LIST_USERS_SUCCESS:
      AuthStore.handleListUsersSuccess(action.data);
      break;
    case ActionTypes.AUTH_CREATE_USER_SUCCESS:
      AuthStore.handleCreateUserSuccess(action.data);
      break;
    case ActionTypes.AUTH_DELETE_USER_SUCCESS:
      AuthStore.handleDeleteUserSuccess(action.data);
      break;
    case ActionTypes.AUTH_DELETE_USER_ERROR:
      AuthStore.handleDeleteUserError(action.error);
      break;
    case ActionTypes.AUTH_REGISTER_SUCCESS:
      AuthStore.handleRegisterSuccess(action.data);
      break;
    case ActionTypes.AUTH_REGISTER_ERROR:
      AuthStore.handleRegisterError(action.error);
      break;
    case ActionTypes.AUTH_VERIFY_SUCCESS:
      AuthStore.handleAuthVerificationSuccess(action.data);
      break;
    case ActionTypes.AUTH_VERIFY_ERROR:
      AuthStore.handleAuthVerificationError(action.error);
      break;
    default:
      break;
  }
});

export default AuthStore;
