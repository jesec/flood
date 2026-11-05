import type {ChannelCredentials, ChannelOptions} from '@grpc/grpc-js';
import {credentials} from '@grpc/grpc-js';
import type {
  RstorrentConnectionSettings,
  RstorrentGRPCSocketConnectionSettings,
  RstorrentGRPCTCPConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';

import {sanitizePath} from '../../util/fileUtil';

export const GRPC_CHANNEL_OPTIONS: ChannelOptions = {
  'grpc.keepalive_time_ms': 15000,
  'grpc.keepalive_timeout_ms': 5000,
  'grpc.keepalive_permit_without_calls': 1,
  'grpc.max_receive_message_length': 64 * 1024 * 1024,
  'grpc.max_send_message_length': 64 * 1024 * 1024,
};

export const createChannelTarget = (
  settings: RstorrentGRPCTCPConnectionSettings | RstorrentGRPCSocketConnectionSettings,
): string =>
  settings.type === 'grpcSocket' ? `unix:${sanitizePath(settings.socket)}` : `${settings.host}:${settings.port}`;

export const createChannelCredentials = (): ChannelCredentials => credentials.createInsecure();

export const connectionSettingsToTarget = (settings: RstorrentConnectionSettings): string =>
  createChannelTarget(settings);
