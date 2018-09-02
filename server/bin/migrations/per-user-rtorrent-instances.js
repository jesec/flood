const chalk = require('chalk');
const config = require('../../../config');
const Users = require('../../models/Users');

const log = data => {
  if (process.env.DEBUG) {
    console.log(data);
  }
}

const migrate = () => {
  log(chalk.green('Migrating data: moving rTorrent connection information to users database'));

  return new Promise((resolve, reject) => {
    Users.listUsers((users, error) => {
      if (error) return reject(error);
      const { scgi = {} } = config;
      const existingConfig = {
        host: scgi.host,
        port: scgi.port,
        socket: scgi.socket === true,
      };

      resolve(
        Promise.all(
          users.map(user => new Promise(
            (resolve, reject) => {
              if (user.socket == null) {
                log(chalk.yellow(`Migrating user ${user.username}`));
                const userPatch = {
                  host: existingConfig.host,
                  port: existingConfig.port,
                  socket: existingConfig.socket,
                };

                if (userPatch.socket && existingConfig.socketPath) {
                  userPatch.socketPath = existingConfig.socketPath;
                }

                Users.updateUser(user.username, userPatch, (response, error) => {
                  if (error) reject(error);
                  resolve(response);
                });
              }

              resolve(user);
            }
          ))
        )
      );
    });
  });
};

module.exports = migrate;