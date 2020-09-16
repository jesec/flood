declare const CONFIG: {
  baseURI: string;
  dbCleanInterval: number;
  dbPath: string;
  tempPath: string;
  disableUsersAndAuth: boolean;
  configUser: {
    host: string;
    port: number;
    socket: boolean;
    socketPath: string;
  };
  floodServerHost: string;
  floodServerPort: number;
  floodServerProxy: string;
  maxHistoryStates: number;
  torrentClientPollInterval: number;
  secret: string;
  ssl: boolean;
  sslKey: string;
  sslCert: string;
  allowedPaths: Array<string> | null;
};

export = CONFIG;
