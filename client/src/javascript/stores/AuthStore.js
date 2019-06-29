import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import AuthActions from '../actions/AuthActions';
import BaseStore from './BaseStore';
import FloodActions from '../actions/FloodActions';
import EventTypes from '../constants/EventTypes';

class AuthStoreClass extends BaseStore {
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

  createUser(credentials) {
    AuthActions.createUser(credentials);
  }

  addOptimisticUser(credentials) {
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

  handleCreateUserSuccess(data) {
    this.addOptimisticUser(data);
    this.emit(EventTypes.AUTH_CREATE_USER_SUCCESS);
  }

  handleDeleteUserError(error) {
    this.emit(EventTypes.AUTH_DELETE_USER_ERROR, error.username);
  }

  handleDeleteUserSuccess(data) {
    this.emit(EventTypes.AUTH_DELETE_USER_SUCCESS, data.username);
  }

  handleListUsersSuccess(nextUserList) {
    this.optimisticUsers = this.optimisticUsers.filter(
      optimisticUser => !nextUserList.some(databaseUser => databaseUser.username === optimisticUser.username),
    );
    this.users = nextUserList;
    this.emit(EventTypes.AUTH_LIST_USERS_SUCCESS);
  }

  handleLoginSuccess(data) {
    this.currentUser.username = data.username;
    this.currentUser.isAdmin = data.isAdmin;
    this.currentUser.isInitialUser = false;
    this.token = data.token;
    this.isAuthenticating = true;
    this.isAuthenticated = true;

    this.emit(EventTypes.AUTH_LOGIN_SUCCESS);
  }

  handleLoginError(error) {
    this.token = null;
    this.isAuthenticated = false;
    this.isAuthenticating = true;
    this.emit(EventTypes.AUTH_LOGIN_ERROR, error);
  }

  handleRegisterSuccess(data) {
    this.currentUser.username = data.username;
    this.currentUser.isAdmin = data.isAdmin;
    this.currentUser.isInitialUser = false;
    this.emit(EventTypes.AUTH_REGISTER_SUCCESS, data);
    FloodActions.restartActivityStream();
  }

  handleRegisterError(error) {
    this.emit(EventTypes.AUTH_REGISTER_ERROR, error);
  }

  handleAuthVerificationSuccess(data) {
    this.currentUser.username = data.username;
    this.currentUser.isAdmin = data.isAdmin;
    this.currentUser.isInitialUser = data.initialUser;
    this.isAuthenticating = true;
    this.isAuthenticated = !data.initialUser;
    this.emit(EventTypes.AUTH_VERIFY_SUCCESS, data);
  }

  handleAuthVerificationError(action) {
    this.isAuthenticated = false;
    this.isAuthenticating = true;
    this.currentUser.isInitialUser = false;
    this.emit(EventTypes.AUTH_VERIFY_ERROR, action.error);
  }
}

const AuthStore = new AuthStoreClass();

AuthStore.dispatcherID = AppDispatcher.register(payload => {
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
      AuthStore.handleAuthVerificationError(action);
      break;
    default:
      break;
  }
});

export default AuthStore;
