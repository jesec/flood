import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import Datastore from '@seald-io/nedb';
import {argon2id, argon2Verify} from 'hash-wasm';

import config from '../../config';
import type {Credentials, UserInDatabase} from '../../shared/schema/Auth';
import type {ClientConnectionSettings} from '../../shared/schema/ClientConnectionSettings';
import {AccessLevel} from '../../shared/schema/constants/Auth';
import {bootstrapServicesForUser, destroyUserServices} from '../services';

const hashPassword = async (password: string): Promise<string> => {
  return argon2id({
    password: password,
    salt: crypto.randomBytes(16),
    parallelism: 1,
    iterations: 256,
    memorySize: 512,
    hashLength: 32,
    outputType: 'encoded',
  });
};

class Users {
  private db = (() => {
    const db = new Datastore({
      autoload: true,
      filename: path.join(config.dbPath, 'users.db'),
    });

    db.ensureIndex({fieldName: 'username', unique: true});
    db.setAutocompactionInterval(config.dbCleanInterval);

    return db;
  })();

  private configUser: UserInDatabase = {
    _id: '_config',
    timestamp: 0,
    username: '_config',
    password: '',
    client: config.configUser as ClientConnectionSettings,
    level: AccessLevel.ADMINISTRATOR,
  };

  getConfigUser(): Readonly<UserInDatabase> {
    return this.configUser;
  }

  async bootstrapServicesForAllUsers(): Promise<void> {
    return this.listUsers()
      .then((users) => Promise.all(users.map((user) => bootstrapServicesForUser(user))))
      .then(() => undefined);
  }

  /**
   * Validates the provided password against the hashed password in database
   *
   * @param {Pick<Credentials, 'username' | 'password'>} credentials - Username and password
   * @return {Promise<AccessLevel>} - Returns access level of the user if matched or rejects with error.
   */
  async comparePassword(credentials: Pick<Credentials, 'username' | 'password'>): Promise<AccessLevel> {
    return this.db.findOneAsync<Credentials>({username: credentials.username}).then((user) => {
      // Wrong data provided
      if (credentials?.password == null) {
        throw new Error();
      }

      // Username not found.
      if (user == null) {
        throw new Error();
      }

      return argon2Verify({
        password: credentials.password,
        hash: user.password,
      }).then((isMatch) => {
        if (isMatch) {
          return user.level;
        } else {
          throw new Error();
        }
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
    const hashed = shouldHash ? await hashPassword(credentials.password).catch(() => undefined) : credentials.password;

    if (this.db == null || hashed == null) {
      throw new Error();
    }

    return this.db
      .insertAsync<Omit<UserInDatabase, '_id'>>({
        ...credentials,
        password: hashed,
        timestamp: Math.ceil(Date.now() / 1000),
      })
      .catch((err) => {
        if (err.message.includes('violates the unique constraint')) {
          throw new Error('Username already exists.');
        }

        throw new Error();
      }) as Promise<UserInDatabase>;
  }

  /**
   * Removes a user.
   *
   * @param {string} username - Name of the user to be removed.
   * @return {Promise<string>} - Returns ID of removed user or rejects with error.
   */
  async removeUser(username: string): Promise<string> {
    return this.db.findOneAsync<UserInDatabase>({username}).then(async ({_id}) => {
      await destroyUserServices(_id, true);

      await this.db.remove({username}, {});
      await fs.promises.rmdir(path.join(config.dbPath, _id), {recursive: true}).catch(() => undefined);

      return _id;
    });
  }

  /**
   * Updates a user.
   *
   * @param {string} username - Name of the user to be updated.
   * @param {Partial<Credentials>} userRecordPatch - Changes to the user.
   * @return {Promise<string>} - Returns new username of updated user or rejects with error.
   */
  async updateUser(username: string, userRecordPatch: Partial<Credentials>): Promise<string> {
    const patch: Omit<Partial<UserInDatabase>, '_id'> = userRecordPatch;

    if (patch.password != null) {
      patch.password = await hashPassword(patch.password);
    }

    if (Object.keys(patch).length > 1 || patch.client == null) {
      patch.timestamp = Math.ceil(Date.now() / 1000);
    }

    return this.db.updateAsync({username}, {$set: patch}, {}).then(({numAffected: numUsersUpdated}) => {
      if (numUsersUpdated === 0) {
        throw new Error();
      }

      return userRecordPatch.username || username;
    });
  }

  /**
   * Looks up a user.
   *
   * @param {string} username - Name of the user to be updated.
   * @return {Promise<UserInDatabase>} - Returns a user or rejects with error.
   */
  async lookupUser(username: string): Promise<UserInDatabase> {
    if (config.authMethod === 'none') {
      return this.getConfigUser();
    }

    return this.db.findOneAsync<UserInDatabase>({username});
  }

  /**
   * Lists users.
   *
   * @return {Promise<UserInDatabase[]>} - Returns users or rejects with error.
   */
  async listUsers(): Promise<UserInDatabase[]> {
    if (config.authMethod === 'none') {
      return [this.getConfigUser()];
    }

    return this.db.findAsync<UserInDatabase>({});
  }

  /**
   * Gets the number of users and route to appropriate handler.
   */
  async initialUserGate(handlers: {handleInitialUser: () => void; handleSubsequentUser: () => void}): Promise<void> {
    const userCount = await this.db.countAsync({});

    if (userCount && userCount > 0) {
      return handlers.handleSubsequentUser();
    }

    return handlers.handleInitialUser();
  }
}

export default new Users();
