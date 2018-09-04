const chalk = require('chalk');
const config = require('../../../config');
const Users = require('../../models/Users');

const log = data => {
  if (process.env.DEBUG) {
    console.log(data);
  }
};

const migrate = () => {
  log(chalk.green('Migrating data: moving rTorrent connection information to users database'));

  return new Promise((resolve, reject) => {
    Users.listUsers((users, error) => {
      if (error) return reject(error);
      const {scgi = {}} = config;
      const existingConfig = {
        host: scgi.host,
        port: scgi.port,
        socketPath: scgi.socketPath,
      };

      resolve(
        Promise.all(
          users.map(
            user =>
              new Promise((resolve, reject) => {
                log(chalk.yellow(`Migrating user ${user.username}`));
                const userPatch = {
                  host: existingConfig.host,
                  port: existingConfig.port,
                };

                if (existingConfig.socketPath && existingConfig.socketPath.trim().length > 0) {
                  userPatch.socketPath = existingConfig.socketPath;
                }

                Users.updateUser(user.username, userPatch, (response, error) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  resolve(response);
                });
              })
          )
        )
      );
    });
  });
};

module.exports = migrate;
