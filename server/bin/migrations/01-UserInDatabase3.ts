import Users from '../../models/Users';

const migrationError = (err?: Error) => {
  if (err) {
    console.error(err);
  }
  console.error('Migration failed. You need to reset the databases manually.');
  process.exit();
};

const migration = () => {
  return Users.listUsers().then((users) => {
    return Promise.all(
      users.map(async (user) => {
        if (user.timestamp != null) {
          // No need to migrate.
          return;
        }

        await Users.updateUser(user.username, {});
      }),
    ).catch((err) => {
      migrationError(err);
    });
  });
};

export default migration;
