import {makeAutoObservable} from 'mobx';

import FloodActions from '@client/actions/FloodActions';

import {AccessLevel} from '@shared/schema/constants/Auth';

import type {
  AuthAuthenticationResponse,
  AuthHTTPBasicResponse,
  AuthVerificationResponse,
} from '@shared/schema/api/auth';
import type {Credentials} from '@shared/schema/Auth';

class AuthStore {
  isAuthenticating = false;
  isAuthenticated = false;
  users: Array<Credentials> = [];
  optimisticUsers: Array<{username: string}> = [];
  httpAuthUser: {
    username: string | null;
    password: string | null;
  } = {
    username: null,
    password: null,
  };

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


  handleCreateUserSuccess({username}: {username: Credentials['username']}): void {
    this.optimisticUsers.push({username});
  }

  handleHTTPBasicSuccess(response: AuthHTTPBasicResponse): void {
    this.httpAuthUser.username = response.username;
    this.httpAuthUser.password = response.password;
  }

  handleListUsersSuccess(nextUserList: Array<Credentials>): void {
    this.optimisticUsers = this.optimisticUsers.filter(
      (optimisticUser) => !nextUserList.some((databaseUser) => databaseUser.username === optimisticUser.username),
    );
    this.users = nextUserList;
  }

  handleLoginSuccess(response: AuthAuthenticationResponse): void {
    this.currentUser.username = response.username;
    this.currentUser.isAdmin = response.level === AccessLevel.ADMINISTRATOR;
    this.currentUser.isInitialUser = false;
    this.isAuthenticating = true;
    this.isAuthenticated = true;
  }

  handleLoginError(): void {
    this.isAuthenticated = false;
    this.isAuthenticating = true;
  }

  handleRegisterSuccess(response: AuthAuthenticationResponse): void {
    this.currentUser.username = response.username;
    this.currentUser.isAdmin = response.level === AccessLevel.ADMINISTRATOR;
    this.currentUser.isInitialUser = false;
    FloodActions.restartActivityStream();
  }

  handleAuthVerificationSuccess(response: AuthVerificationResponse): void {
    if (response.initialUser === true) {
      this.currentUser.isInitialUser = response.initialUser;
    } else {
      this.currentUser = {
        username: response.username,
        isAdmin: response.level === AccessLevel.ADMINISTRATOR,
        isInitialUser: response.initialUser,
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
