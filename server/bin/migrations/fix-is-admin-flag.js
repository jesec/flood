const chalk = require('chalk');
const Users = require('../../models/Users');

const log = data => {
  if (process.env.DEBUG) {
    console.log(data);
  }
};

const migrate = () => {
  log(chalk.green('Migrating data: resolving unset isAdmin flag'));

  return new Promise((resolve, reject) => {
    Users.listUsers((users, error) => {
      if (error) return reject(error);

      resolve(
        Promise.all(
          users.map(user => {
            let userPatch = null;

            if (user.isAdmin == null) {
              userPatch = {isAdmin: true};
            }

            if (userPatch != null) {
              log(chalk.yellow(`Migrating user ${user.username}`));

              return new Promise((resolve, reject) => {
                Users.updateUser(user.username, userPatch, (response, error) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  resolve(response);
                });
              });
            }

            return Promise.resolve();
          })
        )
      );
    });
  });
};

module.exports = migrate;
