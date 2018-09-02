const argon2 = require('argon2');
const Datastore = require('nedb');
const fs = require('fs-extra');
const path = require('path');

const config = require('../../config');
const services = require('../services');

class Users {
  constructor() {
    this.ready = false;
    this.db = this.loadDatabase();
  }

  bootstrapServicesForAllUsers() {
    this.listUsers((users, err) => {
      if (err) throw err;
      if (users && users.length) {
        users.forEach(services.bootstrapServicesForUser);
      }
    });
  }

  comparePassword(credentials, callback) {
    this.db.findOne({username: credentials.username}).exec((err, user) => {
      if (err) {
        return callback(null, err);
      }

      // Username not found.
      if (user == null) {
        return callback(null, user);
      }

      argon2
        .verify(user.password, credentials.password)
        .then(argon2Match => {
          if (argon2Match) {
            return callback(argon2Match);
          }

          callback(null, argon2Match);
        })
        .catch(error => callback(null, error));
    });
  }

  createUser(credentials, callback) {
    const {
      password,
      username,
      host,
      port,
      socketPath,
      isAdmin
    } = credentials;

    if (!this.ready) {
      return callback(null, 'Users database is not ready.');
    }

    if (username === '' || username == null) {
      return callback(null, 'Username cannot be empty.');
    }

    const socket = socketPath != null && socketPath !== '' && 0 < socketPath.trim().length;

    argon2
      .hash(password)
      .then(hash => {
        this.db.insert({ username, password: hash, host, port, socket, socketPath, isAdmin }, (error, user) => {
          if (error) {
            if (error.errorType === 'uniqueViolated') {
              error = 'Username already exists.';
            }

            return callback(null, error);
          }

          services.bootstrapServicesForUser(user);

          return callback({ username });
        });
      })
      .catch(error => {
        callback(null, error);
      });
  }

  removeUser(username, callback) {
    this.db.findOne({username}).exec((err, user) => {
      if (err) {
        return callback(null, err);
      }

      // Username not found.
      if (user == null) {
        return callback(null, user);
      }

      this.db.remove({username}, {}, (err, numRemoved) => {
        if (err) {
          return callback(null, err);
        }

        fs.removeSync(path.join(config.dbPath, user._id));

        return callback({username});
      });
    });
  }

  updateUser(username, userRecordPatch, callback) {
    const nextUserRecordPatch = Object.assign({}, userRecordPatch, {
      socket: userRecordPatch.socketPath != null
    });

    this.db.update({ username }, { $set: nextUserRecordPatch }, (err, numUsersUpdated, updatedUser) => {
      if (err) return callback(null, err);
      // Username not found.
      if (numUsersUpdated === 0) {
        return callback(null, err);
      }

      return callback(nextUserRecordPatch);
    });
  }

  initialUserGate(handlers) {
    this.db.find({}, (err, users) => {
      if (users && users.length > 0) {
        return handlers.handleSubsequentUser();
      }

      return handlers.handleInitialUser();
    });
  }

  loadDatabase() {
    let db = new Datastore({
      autoload: true,
      filename: path.join(config.dbPath, 'users.db')
    });

    db.ensureIndex({fieldName: 'username', unique: true});

    this.ready = true;
    return db;
  }

  lookupUser(credentials, callback) {
    this.db.findOne({username: credentials.username}, (err, user) => {
      if (err) {
        return callback(err);
      }

      return callback(null, user);
    });
  }

  listUsers(callback) {
    this.db.find({}, (err, users) => {
      if (err) {
        return callback(null, err);
      }

      return callback(users);
    });
  }
}

module.exports = new Users();
