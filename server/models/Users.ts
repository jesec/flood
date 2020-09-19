import argon2 from 'argon2';
import Datastore from 'nedb';
import fs from 'fs';
import path from 'path';

import type {Credentials} from '@shared/types/Auth';

import config from '../../config';
import services from '../services';

type UserInDatabase = Required<Credentials> & {_id: string};

class Users {
  db = Users.loadDatabase();
  configUser: UserInDatabase = {
    _id: '_config',
    username: '_config',
    host: config.configUser.socket ? null : config.configUser.host,
    port: config.configUser.socket ? null : config.configUser.port,
    socketPath: config.configUser.socket ? config.configUser.socketPath : null,
    password: '',
    isAdmin: true,
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
    credentials: Credentials,
    callback: (isMatch: boolean, isAdmin: Credentials['isAdmin'], err?: Error) => void,
  ) {
    this.db.findOne({username: credentials.username}, (err: Error | null, user: UserInDatabase): void => {
      if (err) {
        return callback(false, false, err);
      }

      // Wrong data provided
      if (credentials == null || credentials.password == null) {
        return callback(false, false, new Error());
      }

      // Username not found.
      if (user == null) {
        return callback(false, false, user);
      }

      argon2
        .verify(user.password, credentials.password)
        .then((argon2Match) => {
          if (argon2Match) {
            return callback(true, user.isAdmin);
          }
          return callback(false, false, new Error());
        })
        .catch((error) => callback(false, false, error));

      return undefined;
    });
  }

  createUser(
    credentials: Credentials,
    callback: (data: {username: Credentials['username']} | null, error?: Error | null) => void,
  ): void {
    const {password, username, host, port, socketPath, isAdmin} = credentials;

    if (this.db == null) {
      return callback(null, new Error('Users database is not ready.'));
    }

    if (username === '' || username == null) {
      return callback(null, new Error('Username cannot be empty.'));
    }

    if (password == null) {
      return callback(null, new Error('Password cannot be empty'));
    }

    if ((host == null || Number(port) == null) && socketPath == null) {
      return callback(null, new Error('Connection settings cannot be empty'));
    }

    argon2
      .hash(password)
      .then((hash) => {
        const userEntry: Required<Credentials> = {
          username,
          password: hash,
          host: host || null,
          port: Number(port) || null,
          socketPath: socketPath || null,
          isAdmin: isAdmin || false,
        };
        this.db.insert(userEntry, (error, user) => {
          if (error) {
            if (error.message.includes('violates the unique constraint')) {
              return callback(null, new Error('Username already exists.'));
            }

            return callback(null, error);
          }

          services.bootstrapServicesForUser(user);
          return callback({username});
        });
      })
      .catch((error) => {
        callback(null, error);
      });

    return undefined;
  }

  removeUser(
    username: Credentials['username'],
    callback: (data: Credentials | null, error?: Error | null) => void,
  ): void {
    this.db.findOne({username}, (findError: Error | null, user: UserInDatabase): void => {
      if (findError) {
        return callback(null, findError);
      }

      // Username not found.
      if (user == null || user._id == null) {
        return callback(null, new Error('User not found.'));
      }

      this.db.remove({username}, {}, (removeError) => {
        if (removeError) {
          return callback(null, removeError);
        }

        fs.rmdirSync(path.join(config.dbPath, user._id), {recursive: true});

        return callback({username});
      });

      return undefined;
    });
  }

  updateUser(
    username: Credentials['username'],
    userRecordPatch: Partial<Credentials>,
    callback: (response: UserInDatabase | null, updateUserError?: Error | null) => void,
  ): void {
    this.db.update(
      {username},
      {$set: userRecordPatch},
      undefined,
      (err: Error | null, numUsersUpdated: number, updatedUser: UserInDatabase): void => {
        if (err) {
          return callback(null, err);
        }

        // Username not found.
        if (numUsersUpdated === 0) {
          return callback(null, err);
        }

        return callback(updatedUser);
      },
    );
  }

  initialUserGate(handlers: {handleInitialUser: () => void; handleSubsequentUser: () => void}) {
    this.db.find({}, (_err: Error | null, users: Array<UserInDatabase>): void => {
      if (users && users.length > 0) {
        return handlers.handleSubsequentUser();
      }

      return handlers.handleInitialUser();
    });
  }

  lookupUser(credentials: Credentials, callback: (err: Error | null, user?: UserInDatabase) => void): void {
    if (config.disableUsersAndAuth) {
      return callback(null, this.getConfigUser());
    }

    this.db.findOne({username: credentials.username}, (err: Error | null, user: UserInDatabase): void => {
      if (err) {
        return callback(err);
      }

      return callback(null, user);
    });

    return undefined;
  }

  listUsers(callback: (users: Array<UserInDatabase> | null, err?: Error) => void): void {
    if (config.disableUsersAndAuth) {
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
