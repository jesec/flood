// Deprecated data structure. Not used outside of migration.
export type UserInDatabase1 = {
  _id: string;
  username: string;
  password: string;
  host?: string | null;
  port?: number | null;
  socketPath?: string | null;
  isAdmin: boolean;
};
