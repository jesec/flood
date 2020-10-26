import argon2 from 'argon2-browser';
import crypto from 'crypto';
import Datastore from 'nedb';
import fs from 'fs';
import path from 'path';

import {AccessLevel} from '../../shared/schema/constants/Auth';

import type {Credentials, UserInDatabase} from '../../shared/schema/Auth';

import config from '../../config';
import services from '../services';

class Users {
  db = Users.loadDatabase();
  configUser: UserInDatabase = {
    _id: '_config',
    username: '_config',
    password: '',
    client: config.configUser,
    level: AccessLevel.ADMINISTRATOR,
  };

  static loadDatabase(): Datastore {
    const db = new Datastore({
      autoload: true,
      filename: path.join(config.dbPath, 'users.db'),
    });

    db.ensureIndex({fieldName: 'username', unique: true});

    return db;
  }

  getConfigUser(): Readonly<UserInDatabase> {
    return this.configUser;
  }

  bootstrapServicesForAllUsers() {
    this.listUsers((users, err) => {
      if (err) throw err;
      if (users && users.length) {
        users.forEach(services.bootstrapServicesForUser);
      }
    });
  }

  comparePassword(
    credentials: Pick<Credentials, 'username' | 'password'>,
    callback: (isMatch: boolean, level: Credentials['level'] | null, err?: Error) => void,
  ) {
    this.db.findOne({username: credentials.username}, (err: Error | null, user: UserInDatabase): void => {
      if (err) {
        return callback(false, null, err);
      }

      // Wrong data provided
      if (credentials?.password == null) {
        return callback(false, null, new Error());
      }

      // Username not found.
      if (user == null) {
        return callback(false, null, user);
      }

      argon2
        .verify({pass: credentials.password, encoded: user.password})
        .then(() => callback(true, user.level))
        .catch((e) => callback(false, null, e));

      return undefined;
    });
  }

  createUser(
    credentials: Credentials,
    callback: (user: UserInDatabase | null, error?: Error) => void,
    shouldHash = true,
  ): void {
    if (this.db == null) {
      return callback(null, new Error('Users database is not ready.'));
    }

    argon2
      .hash({pass: credentials.password, salt: crypto.randomBytes(16).toString('hex')})
      .then((hash) => {
        this.db.insert(
          {
            ...credentials,
            password: shouldHash ? hash.encoded : credentials.password,
          },
          (error, user) => {
            if (error) {
              if (error.message.includes('violates the unique constraint')) {
                return callback(null, new Error('Username already exists.'));
              }

              return callback(null, error);
            }

            return callback(user as UserInDatabase);
          },
        );
      })
      .catch((error) => {
        callback(null, error);
      });

    return undefined;
  }

  removeUser(
    username: Credentials['username'],
    callback: (userId: UserInDatabase['_id'] | null, error?: Error) => void,
  ): void {
    this.db.findOne({username}, (findError: Error | null, user: UserInDatabase): void => {
      if (findError) {
        return callback(null, findError);
      }

      // Username not found.
      if (user?._id == null) {
        return callback(null, new Error('User not found.'));
      }

      const userId = user._id;
      this.db.remove({username}, {}, (removeError) => {
        if (removeError) {
          return callback(null, removeError);
        }

        fs.rmdirSync(path.join(config.dbPath, user._id), {recursive: true});

        return callback(userId);
      });

      return undefined;
    });
  }

  updateUser(
    username: Credentials['username'],
    userRecordPatch: Partial<Credentials>,
    callback: (newUsername: Credentials['username'] | null, updateUserError?: Error | null) => void,
  ): void {
    this.db.update({username}, {$set: userRecordPatch}, {}, (err: Error | null, numUsersUpdated: number): void => {
      if (err) {
        return callback(null, err);
      }

      // Username not found.
      if (numUsersUpdated === 0) {
        return callback(null, err);
      }

      return callback(userRecordPatch.username || username);
    });
  }

  initialUserGate(handlers: {handleInitialUser: () => void; handleSubsequentUser: () => void}) {
    this.db.find({}, (_err: Error | null, users: Array<UserInDatabase>): void => {
      if (users && users.length > 0) {
        return handlers.handleSubsequentUser();
      }

      return handlers.handleInitialUser();
    });
  }

  lookupUser(username: string, callback: (err: Error | null, user?: UserInDatabase) => void): void {
    if (config.authMethod === 'none') {
      return callback(null, this.getConfigUser());
    }

    this.db.findOne({username}, (err: Error | null, user: UserInDatabase): void => {
      if (err) {
        return callback(err);
      }

      return callback(null, user);
    });

    return undefined;
  }

  listUsers(callback: (users: Array<UserInDatabase> | null, err?: Error) => void): void {
    if (config.authMethod === 'none') {
      return callback([this.getConfigUser()]);
    }

    this.db.find({}, (err: Error | null, users: Array<UserInDatabase>): void => {
      if (err) {
        return callback(null, err);
      }

      return callback(users);
    });

    return undefined;
  }
}

export default new Users();
