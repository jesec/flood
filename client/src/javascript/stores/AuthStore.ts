import {makeAutoObservable} from 'mobx';

import FloodActions from '@client/actions/FloodActions';

import {AccessLevel} from '@shared/schema/constants/Auth';

import type {
  AuthAuthenticationResponse,
  AuthRegistrationResponse,
  AuthVerificationResponse,
} from '@shared/schema/api/auth';
import type {Credentials} from '@shared/schema/Auth';

class AuthStore {
  isAuthenticating = false;
  isAuthenticated = false;
  users: Array<Credentials> = [];
  optimisticUsers: Array<{username: string}> = [];
  currentUser: {
    isAdmin: boolean;
    isInitialUser: boolean;
    username: string | null;
  } = {
    isAdmin: false,
    isInitialUser: false,
    username: null,
  };

  constructor() {
    makeAutoObservable(this);
  }

  handleCreateUserSuccess({username}: AuthRegistrationResponse): void {
    this.optimisticUsers.push({username});
  }

  handleListUsersSuccess(nextUserList: Array<Credentials>): void {
    this.optimisticUsers = this.optimisticUsers.filter(
      (optimisticUser) => !nextUserList.some((databaseUser) => databaseUser.username === optimisticUser.username),
    );
    this.users = nextUserList;
  }

  handleLoginSuccess({username, level}: AuthAuthenticationResponse): void {
    this.currentUser.username = username;
    this.currentUser.isAdmin = level === AccessLevel.ADMINISTRATOR;
    this.currentUser.isInitialUser = false;
    this.isAuthenticating = true;
    this.isAuthenticated = true;
  }

  handleLoginError(): void {
    this.isAuthenticated = false;
    this.isAuthenticating = true;
  }

  handleRegisterSuccess({username, level}: AuthRegistrationResponse): void {
    this.currentUser.username = username;
    this.currentUser.isAdmin = level === AccessLevel.ADMINISTRATOR;
    this.currentUser.isInitialUser = false;
    FloodActions.restartActivityStream();
  }

  handleAuthVerificationSuccess(response: AuthVerificationResponse): void {
    if (response.initialUser === true) {
      this.currentUser.isInitialUser = true;
    } else {
      const {username, level} = response;

      this.currentUser = {
        username: username,
        isAdmin: level === AccessLevel.ADMINISTRATOR,
        isInitialUser: false,
      };
    }

    this.isAuthenticating = true;
    this.isAuthenticated = !this.currentUser.isInitialUser;
  }

  handleAuthVerificationError(): void {
    this.isAuthenticated = false;
    this.isAuthenticating = true;
    this.currentUser.isInitialUser = false;
  }
}

export default new AuthStore();
