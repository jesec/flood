const chalk = require('chalk');
const Users = require('../../models/Users');

const log = data => {
  if (process.env.DEBUG) {
    console.log(data);
  }
};

const migrate = () => {
  log(chalk.green('Migrating data: resolving unset isAdmin flag'));

  return new Promise((migrateResolve, migrateReject) => {
    Users.listUsers((users, migrateError) => {
      if (migrateError) return migrateReject(migrateError);

      migrateResolve(
        Promise.all(
          users.map(user => {
            let userPatch = null;

            if (user.isAdmin == null) {
              userPatch = {isAdmin: true};
            }

            if (userPatch != null) {
              log(chalk.yellow(`Migrating user ${user.username}`));

              return new Promise((updateUserResolve, updateUserReject) => {
                Users.updateUser(user.username, userPatch, (response, updateUserError) => {
                  if (updateUserError) {
                    updateUserReject(updateUserError);
                    return;
                  }

                  updateUserResolve(response);
                });
              });
            }

            return Promise.resolve();
          }),
        ),
      );
    });
  });
};

module.exports = migrate;
