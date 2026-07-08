export {NeptuneClient} from './client.ts';
export type {NeptuneClientOptions, NeptuneMethod, NeptuneMethodMap} from './client.ts';

export {NeptuneConnectionError, NeptuneHTTPError, NeptuneRPCError} from './errors.ts';

export type {
  AddTorrentParams,
  AddTorrentResult,
  AddTrackerParams,
  DelCustomParams,
  GlobalSpeedLimitParams,
  InfoHashParams,
  ListTorrentParams,
  MoveTorrentParams,
  Peer,
  RemoveTorrentParams,
  RemoveTrackerParams,
  ReplaceTrackersParams,
  SetCustomParams,
  SetFilePriorityParams,
  SpeedLimitParams,
  TagsParams,
  Torrent,
  TorrentFile,
  TorrentFiles,
  TorrentInfo,
  TorrentList,
  TorrentPeers,
  TorrentState,
  TorrentTrackers,
  Tracker,
  TransferSummary,
  UpdateCustomParams,
} from './types.ts';
