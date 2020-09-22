export interface ConnectionSettings {
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

// auth/authenticate
export interface AuthAuthenticationResponse {
  success: boolean;
  token: string;
  username: string;
  isAdmin: boolean;
}

// auth/verify
export interface AuthVerificationResponse extends Pick<AuthAuthenticationResponse, 'token'> {
  initialUser: boolean;
  username: string;
  isAdmin: boolean;
}
