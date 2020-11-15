import {argon2id, argon2Verify} from 'hash-wasm';
import crypto from 'crypto';
import Datastore from 'nedb';
import fs from 'fs';
import path from 'path';

import {AccessLevel} from '../../shared/schema/constants/Auth';
import config from '../../config';
import services from '../services';

import type {ClientConnectionSettings} from '../../shared/schema/ClientConnectionSettings';
import type {Credentials, UserInDatabase} from '../../shared/schema/Auth';

class Users {
  db = Users.loadDatabase();
  configUser: UserInDatabase = {
    _id: '_config',
    username: '_config',
    password: '',
    client: config.configUser as ClientConnectionSettings,
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

  /**
   * Validates the provided password against the hashed password in database
   *
   * @param {Pick<Credentials, 'username' | 'password'>} credentials - Username and password
   * @return {Promise<AccessLevel>} - Returns access level of the user if matched or rejects with error.
   */
  async comparePassword(credentials: Pick<Credentials, 'username' | 'password'>): Promise<AccessLevel> {
    return new Promise((resolve, reject) => {
      this.db.findOne({username: credentials.username}, (err: Error | null, user: UserInDatabase): void => {
        if (err) {
          reject(err);
          return;
        }

        // Wrong data provided
        if (credentials?.password == null) {
          reject(new Error());
          return;
        }

        // Username not found.
        if (user == null) {
          reject(new Error());
          return;
        }

        argon2Verify({
          password: credentials.password,
          hash: user.password,
        }).then(
          (isMatch) => {
            if (isMatch) {
              resolve(user.level);
            } else {
              reject(new Error());
            }
          },
          (verifyErr) => {
            reject(verifyErr);
          },
        );
      });
    });
  }

  /**
   * Creates a new user.
   * Note that validation function always expects an argon2 hash.
   *
   * @param {Credentials} credentials - Full credentials of a user.
   * @param {boolean} shouldHash - Should the password be hashed or stored as-is.
   * @return {Promise<UserInDatabase>} - Returns the created user or rejects with error.
   */
  async createUser(credentials: Credentials, shouldHash = true): Promise<UserInDatabase> {
    const hashed = shouldHash
      ? await argon2id({
          password: credentials.password,
          salt: crypto.randomBytes(16),
          parallelism: 1,
          iterations: 256,
          memorySize: 512,
          hashLength: 32,
          outputType: 'encoded',
        }).catch(() => undefined)
      : credentials.password;

    if (this.db == null || hashed == null) {
      return Promise.reject(new Error());
    }

    return new Promise((resolve, reject) => {
      this.db.insert(
        {
          ...credentials,
          password: hashed,
        },
        (error, user) => {
          if (error) {
            if (error.message.includes('violates the unique constraint')) {
              reject(new Error('Username already exists.'));
              return;
            }

            reject(new Error());
            return;
          }

          if (user == null) {
            reject(new Error());
            return;
          }

          resolve(user as UserInDatabase);
        },
      );
    });
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
