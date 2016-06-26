import AuthActions from '../actions/AuthActions';
import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';

class AuthStoreClass extends BaseStore {
  constructor() {
    super();
    this.token = null;
    this.users = [];
  }

  authenticate(credentials) {
    AuthActions.authenticate({
      username: credentials.username,
      password: credentials.password
    });
  }

  createUser(credentials) {
    AuthActions.createUser(credentials);
  }

  deleteUser(username) {
    AuthActions.deleteUser(username);
  }

  fetchUserList() {
    AuthActions.fetchUsers();
  }

  getToken() {
    return this.token;
  }

  getUsers() {
    return this.users;
  }

  handleCreateUserError(error) {
    this.emit(EventTypes.AUTH_CREATE_USER_ERROR, error);
  }

  handleCreateUserSuccess(data) {
    this.emit(EventTypes.AUTH_CREATE_USER_SUCCESS);
  }

  handleDeleteUserError(error) {
    this.emit(EventTypes.AUTH_DELETE_USER_ERROR, error.username);
  }

  handleDeleteUserSuccess(data) {
    this.emit(EventTypes.AUTH_DELETE_USER_SUCCESS, data.username);
  }

  handleListUsersError(error) {
    this.emit(EventTypes.AUTH_LIST_USERS_ERROR);
  }

  handleListUsersSuccess(data) {
    this.users = data;
    this.emit(EventTypes.AUTH_LIST_USERS_SUCCESS);
  }

  handleLoginSuccess(data) {
    this.emit(EventTypes.AUTH_LOGIN_SUCCESS);
    this.token = data.token;
  }

  handleLoginError(error) {
    this.token = null;
    this.emit(EventTypes.AUTH_LOGIN_ERROR, error);
  }

  handleRegisterSuccess(data) {
    this.emit(EventTypes.AUTH_REGISTER_SUCCESS, data);
  }

  handleRegisterError(error) {
    this.emit(EventTypes.AUTH_REGISTER_ERROR, error);
  }

  register(credentials) {
    AuthActions.register({
      username: credentials.username,
      password: credentials.password
    });
  }

  verify() {
    AuthActions.verify();
  }
}

let AuthStore = new AuthStoreClass();

AuthStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action, source} = payload;

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
    case ActionTypes.AUTH_LIST_USERS_ERROR:
      AuthStore.handleListUsersError(action.error);
      break;
    case ActionTypes.AUTH_CREATE_USER_SUCCESS:
      AuthStore.handleCreateUserSuccess(action.data);
      break;
    case ActionTypes.AUTH_CREATE_USER_ERROR:
      AuthStore.handleCreateUserError(action.error.data);
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
      AuthStore.handleRegisterError(action.error.data);
      break;
    case ActionTypes.AUTH_VERIFY_SUCCESS:
      AuthStore.emit(EventTypes.AUTH_VERIFY_SUCCESS,
        action.data);
      break;
    case ActionTypes.AUTH_VERIFY_ERROR:
      AuthStore.emit(EventTypes.AUTH_VERIFY_ERROR,
        action.error);
      break;
  }
});

export default AuthStore;
