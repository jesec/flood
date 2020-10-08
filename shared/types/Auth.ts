export interface ConnectionSettingsForm {
  connectionType?: 'socket' | 'tcp';
  rtorrentSocketPath?: string;
  rtorrentPort?: number;
  rtorrentHost?: string;
}

export interface Credentials {
  username: string;
  password?: string;
  host?: string | null;
  port?: number | null;
  socketPath?: string | null;
  isAdmin?: boolean;
}

export type UserInDatabase = Required<Credentials> & {_id: string};
