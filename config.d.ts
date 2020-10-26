import type {AuthMethod} from '@shared/schema/Auth';
import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

declare const CONFIG: {
  baseURI: string;
  dbCleanInterval: number;
  dbPath: string;
  tempPath: string;
  authMethod: AuthMethod;
  configUser: ClientConnectionSettings;
  floodServerHost: string;
  floodServerPort: number;
  floodServerProxy: string;
  maxHistoryStates: number;
  torrentClientPollInterval: number;
  torrentClientPollIntervalIdle: number;
  secret: string;
  ssl: boolean;
  sslKey: string;
  sslCert: string;
  diskUsageService: {
    watchMountPoints: Array<string>;
  };
  allowedPaths: Array<string> | null;
};

export = CONFIG;
