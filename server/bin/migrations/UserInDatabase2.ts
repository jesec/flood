import {AccessLevel} from '../../../shared/schema/constants/Auth';
import Users from '../../models/Users';

import type {Credentials} from '../../../shared/schema/Auth';
import type {RTorrentConnectionSettings} from '../../../shared/schema/ClientConnectionSettings';
import type {UserInDatabase1} from './types/UserInDatabase1';

const migrationError = (err?: Error) => {
  if (err) {
    console.error(err);
  }
  console.error('Migration failed. You need to reset the databases manually.');
  process.exit();
};

const migration = () => {
  return new Promise<void>((resolve, _reject) => {
    Users.listUsers((users, err) => {
      if (users == null || err) {
        return;
      }

      Promise.all(
        users.map((user) => {
          return new Promise<void>((migratedResolve, _migratedReject) => {
            if (user.client != null) {
              // No need to migrate.
              migratedResolve();
              return;
            }

            const userV1 = (user as unknown) as UserInDatabase1;

            let connectionSettings: RTorrentConnectionSettings | null = null;
            if (userV1.socketPath != null) {
              connectionSettings = {
                client: 'rTorrent',
                type: 'socket',
                version: 1,
                socket: userV1.socketPath,
              };
            } else if (userV1.host != null && userV1.port != null) {
              connectionSettings = {
                client: 'rTorrent',
                type: 'tcp',
                version: 1,
                host: userV1.host,
                port: userV1.port,
              };
            }

            if (connectionSettings == null) {
              migrationError(new Error('Corrupted client connection settings.'));
              return;
            }

            const userV2: Credentials = {
              username: userV1.username,
              password: userV1.password,
              client: connectionSettings,
              level: userV1.isAdmin ? AccessLevel.ADMINISTRATOR : AccessLevel.USER,
            };

            Users.removeUser(userV1.username, (id, errRemoval) => {
              if (errRemoval) {
                migrationError(errRemoval);
                return;
              }

              if (id == null) {
                migrationError(new Error('Wrong user ID'));
                return;
              }

              Users.createUser(userV2, false).then(
                () => {
                  migratedResolve();
                },
                (errCreation) => {
                  migrationError(errCreation);
                },
              );
            });
          });
        }),
      ).then(() => {
        resolve();
      });
    });
  });
};

export default migration;
