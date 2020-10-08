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

// POST /api/auth/authenticate
export type AuthAuthenticationOptions = Required<Pick<Credentials, 'username' | 'password'>>;

// POST /api/auth/authenticate - success response
export interface AuthAuthenticationResponse {
  success: boolean;
  token: string;
  username: string;
  isAdmin: boolean;
}

// POST /api/auth/register
export type AuthRegisterOptions = Required<
  Pick<Credentials, 'username' | 'password' | 'host' | 'port' | 'socketPath' | 'isAdmin'>
>;

// PATCH /api/auth/users/{username}
export type AuthUpdateUserOptions = Partial<Credentials>;

// GET /api/auth/verify - success response
export interface AuthVerificationResponse extends Pick<AuthAuthenticationResponse, 'token'> {
  initialUser: boolean;
  username: string;
  isAdmin: boolean;
}
