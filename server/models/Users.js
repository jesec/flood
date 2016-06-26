'use strict';

let Datastore = require('nedb');

let bcrypt = require('bcrypt-nodejs');
let config = require('../../config');

class Users {
  constructor() {
    this.ready = false;
    this.db = this.loadDatabase();
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

      bcrypt.compare(credentials.password, user.password, (err, isMatch) => {
        if (err) {
          return callback(null, err);
        }

        return callback(isMatch);
      });
    });
  }

  createUser(credentials, callback) {
    if (!this.ready) {
      return callback(null, 'Users database is not ready.');
    }

    if (credentials.username === '' || credentials.username == null) {
      return callback(null, 'Username cannot be empty.');
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return callback(null, err);
      }

      let username = credentials.username;

      bcrypt.hash(credentials.password, salt, null, (err, hash) => {
        if (err) {
          return callback(null, err);
        }

        this.db.insert({username: username, password: hash}, (err, user) => {
          if (err) {
            if (err.errorType = 'uniqueViolated') {
              err = 'Username already exists.';
            }

            return callback(null, err);
          }

          return callback({username: credentials.username});
        });
      });
    });
  }

  removeUser(username, callback) {
    this.db.remove({username: username}, {}, (err, numRemoved) => {
      if (err) {
        return callback(null, err);
      }

      return callback({username: username});
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
      filename: `${config.dbPath}users.db`
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

      return callback(users.map((user) => {
        return {username: user.username};
      }));
    });
  }
}

module.exports = new Users();
