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
        return callback(err);
      }

      // Username not found.
      if (user == null) {
        return callback(null, user);
      }

      bcrypt.compare(credentials.password, user.password, (err, isMatch) => {
        if (err) {
          return callback(err);
        }

        return callback(null, isMatch);
      });
    });
  }

  createUser(credentials, callback) {
    if (!this.ready) {
      callback({message: 'Users database is not ready.'});
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        callback(err);
        return;
      }

      let username = credentials.username;

      bcrypt.hash(credentials.password, salt, null, (err, hash) => {
        if (err) {
          callback(err);
          return;
        }

        this.db.insert({username: username, password: hash}, (err, user) => {
          if (err) {
            callback(err);
            return;
          }

          callback(null, {username: credentials.username});
        });
      });
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
      filename: `${config.dbPath}authUsers.db`
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
}

module.exports = new Users();
