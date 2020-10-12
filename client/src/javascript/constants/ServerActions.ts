import type {AuthAuthenticationResponse, AuthVerificationResponse} from '@shared/schema/api/auth';
import type {Credentials} from '@shared/schema/Auth';
import type {ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSettings} from '@shared/types/FloodSettings';
import type {NotificationFetchOptions, NotificationState} from '@shared/types/Notification';
import type {ServerEvents} from '@shared/types/ServerEvents';
import type {TorrentDetails} from '@shared/types/Torrent';

import type {SettingsSaveOptions} from '../stores/SettingsStore';
import type {Feeds, Items, Rules} from '../stores/FeedsStore';

const errorTypes = [
  'AUTH_LOGIN_ERROR',
  'AUTH_LOGOUT_ERROR',
  'AUTH_REGISTER_ERROR',
  'AUTH_VERIFY_ERROR',
  'CLIENT_ADD_TORRENT_ERROR',
  'FLOOD_CLEAR_NOTIFICATIONS_ERROR',
  'CLIENT_CONNECTION_TEST_ERROR',
  'CLIENT_FETCH_TORRENT_DETAILS_ERROR',
  'CLIENT_SET_FILE_PRIORITY_ERROR',
  'CLIENT_SET_TAXONOMY_ERROR',
  'CLIENT_SET_THROTTLE_ERROR',
  'CLIENT_SET_TORRENT_PRIORITY_ERROR',
  'CLIENT_SET_TRACKER_ERROR',
  'CLIENT_SETTINGS_FETCH_REQUEST_ERROR',
  'CLIENT_SETTINGS_SAVE_ERROR',
  'CLIENT_START_TORRENT_ERROR',
  'CLIENT_STOP_TORRENT_ERROR',
  'FLOOD_FETCH_NOTIFICATIONS_ERROR',
  'SETTINGS_FEED_MONITOR_FEED_ADD_ERROR',
  'SETTINGS_FEED_MONITOR_FEED_MODIFY_ERROR',
  'SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR',
  'SETTINGS_FEED_MONITORS_FETCH_ERROR',
  'SETTINGS_FEED_MONITOR_RULE_ADD_ERROR',
  'SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR',
  'SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR',
  'SETTINGS_FETCH_REQUEST_ERROR',
  'SETTINGS_SAVE_REQUEST_ERROR',
] as const;

const successTypes = [
  'AUTH_LOGOUT_SUCCESS',
  'CLIENT_CHECK_HASH_SUCCESS',
  'CLIENT_CONNECTION_TEST_SUCCESS',
  'CLIENT_SET_TORRENT_PRIORITY_SUCCESS',
  'CLIENT_SET_TAXONOMY_SUCCESS',
  'CLIENT_SET_THROTTLE_SUCCESS',
  'CLIENT_SET_TRACKER_SUCCESS',
  'CLIENT_START_TORRENT_SUCCESS',
  'CLIENT_STOP_TORRENT_SUCCESS',
  'SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS',
  'SETTINGS_FEED_MONITOR_FEED_MODIFY_SUCCESS',
  'SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS',
] as const;

interface BaseErrorAction {
  type: typeof errorTypes[number];
  error?: Error;
}

interface BaseSuccessAction {
  type: typeof successTypes[number];
}

// AuthActions
interface AuthCreateUserSuccessAction {
  type: 'AUTH_CREATE_USER_SUCCESS';
  data: Pick<Credentials, 'username'>;
}

interface AuthDeleteUserSuccessAction {
  type: 'AUTH_DELETE_USER_SUCCESS';
  data: Pick<Credentials, 'username'>;
}

interface AuthDeleteUserErrorAction {
  type: 'AUTH_DELETE_USER_ERROR';
  error: Pick<Credentials, 'username'>;
}

interface AuthListUsersSuccessAction {
  type: 'AUTH_LIST_USERS_SUCCESS';
  data: Array<Credentials>;
}

interface AuthLoginSuccessAction {
  type: 'AUTH_LOGIN_SUCCESS';
  data: AuthAuthenticationResponse;
}

interface AuthVerifySuccessAction {
  type: 'AUTH_VERIFY_SUCCESS';
  data: AuthVerificationResponse;
}

interface AuthRegisterSuccessAction {
  type: 'AUTH_REGISTER_SUCCESS';
  data: AuthAuthenticationResponse;
}

type AuthAction =
  | AuthCreateUserSuccessAction
  | AuthDeleteUserSuccessAction
  | AuthDeleteUserErrorAction
  | AuthListUsersSuccessAction
  | AuthLoginSuccessAction
  | AuthVerifySuccessAction
  | AuthRegisterSuccessAction;

// ClientActions
interface ClientCheckHashErrorAction {
  type: 'CLIENT_CHECK_HASH_ERROR';
  error: {
    error: Error;
    count: number;
  };
}

interface ClientFetchTorrentMediainfoSuccessAction {
  type: 'CLIENT_FETCH_TORRENT_MEDIAINFO_SUCCESS';
  data: {hash: string; output: string};
}

interface ClientSetFilePrioritySuccessAction {
  type: 'CLIENT_SET_FILE_PRIORITY_SUCCESS';
  data: {hash: string};
}

interface ClientSettingsFetchRequestSuccessAction {
  type: 'CLIENT_SETTINGS_FETCH_REQUEST_SUCCESS';
  data: ClientSettings;
}

export interface ClientSettingsSaveSuccessAction {
  type: 'CLIENT_SETTINGS_SAVE_SUCCESS';
  options: SettingsSaveOptions;
}

type ClientAction =
  | ClientCheckHashErrorAction
  | ClientFetchTorrentMediainfoSuccessAction
  | ClientSetFilePrioritySuccessAction
  | ClientSettingsFetchRequestSuccessAction
  | ClientSettingsSaveSuccessAction;

// FloodActions
type ServerEventAction<T extends keyof ServerEvents> = {
  type: T;
  data: ServerEvents[T];
};

interface FloodClearNotificationsSuccessAction {
  type: 'FLOOD_CLEAR_NOTIFICATIONS_SUCCESS';
  data: NotificationFetchOptions;
}

interface FloodFetchNotificationsSuccessAction {
  type: 'FLOOD_FETCH_NOTIFICATIONS_SUCCESS';
  data: NotificationState;
}

type FloodAction =
  | ServerEventAction<'CLIENT_CONNECTIVITY_STATUS_CHANGE'>
  | ServerEventAction<'DISK_USAGE_CHANGE'>
  | ServerEventAction<'NOTIFICATION_COUNT_CHANGE'>
  | ServerEventAction<'TAXONOMY_FULL_UPDATE'>
  | ServerEventAction<'TAXONOMY_DIFF_CHANGE'>
  | ServerEventAction<'TORRENT_LIST_FULL_UPDATE'>
  | ServerEventAction<'TORRENT_LIST_DIFF_CHANGE'>
  | ServerEventAction<'TRANSFER_HISTORY_FULL_UPDATE'>
  | ServerEventAction<'TRANSFER_SUMMARY_FULL_UPDATE'>
  | ServerEventAction<'TRANSFER_SUMMARY_DIFF_CHANGE'>
  | FloodClearNotificationsSuccessAction
  | FloodFetchNotificationsSuccessAction;

// SettingsActions
interface SettingsFeedMonitorRemoveErrorAction {
  type: 'SETTINGS_FEED_MONITOR_REMOVE_ERROR';
  error: {id: string};
}

interface SettingsFeedMonitorRemoveSuccessAction {
  type: 'SETTINGS_FEED_MONITOR_REMOVE_SUCCESS';
  data: {id: string};
}

interface SettingsFeedMonitorFeedsFetchSuccessAction {
  type: 'SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS';
  data: Feeds;
}

interface SettingsFeedMonitorRulesFetchSuccessAction {
  type: 'SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS';
  data: Rules;
}

interface SettingsFeedMonitorsFetchSuccessAction {
  type: 'SETTINGS_FEED_MONITORS_FETCH_SUCCESS';
  data: {feeds: Feeds; rules: Rules};
}

interface SettingsFeedMonitorItemsFetchSuccessAction {
  type: 'SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS';
  data: Items;
}

interface SettingsFetchRequestSuccessAction {
  type: 'SETTINGS_FETCH_REQUEST_SUCCESS';
  data: Partial<FloodSettings>;
}

export interface SettingsSaveRequestSuccessAction {
  type: 'SETTINGS_SAVE_REQUEST_SUCCESS';
  options: SettingsSaveOptions;
}

type SettingsAction =
  | SettingsFeedMonitorRemoveErrorAction
  | SettingsFeedMonitorRemoveSuccessAction
  | SettingsFeedMonitorFeedsFetchSuccessAction
  | SettingsFeedMonitorRulesFetchSuccessAction
  | SettingsFeedMonitorsFetchSuccessAction
  | SettingsFeedMonitorItemsFetchSuccessAction
  | SettingsFetchRequestSuccessAction
  | SettingsSaveRequestSuccessAction;

// TorrentActions
interface ClientFetchTorrentDetailsSuccessAction {
  type: 'CLIENT_FETCH_TORRENT_DETAILS_SUCCESS';
  data: {hash: string; torrentDetails: TorrentDetails};
}

interface ClientAddTorrentSuccessAction {
  type: 'CLIENT_ADD_TORRENT_SUCCESS';
  data: {count: number; start?: boolean; destination?: string};
}

interface ClientMoveTorrentsSuccessAction {
  type: 'CLIENT_MOVE_TORRENTS_SUCCESS';
  data: {count: number};
}

interface ClientMoveTorrentsErrorAction {
  type: 'CLIENT_MOVE_TORRENTS_ERROR';
  error: {count: number};
}

interface ClientRemoveTorrentSuccessAction {
  type: 'CLIENT_REMOVE_TORRENT_SUCCESS';
  data: {count: number; deleteData: boolean};
}

interface ClientRemoveTorrentErrorAction {
  type: 'CLIENT_REMOVE_TORRENT_ERROR';
  error: {count: number};
}

type TorrentAction =
  | ClientFetchTorrentDetailsSuccessAction
  | ClientAddTorrentSuccessAction
  | ClientMoveTorrentsSuccessAction
  | ClientMoveTorrentsErrorAction
  | ClientRemoveTorrentSuccessAction
  | ClientRemoveTorrentErrorAction;

export type ServerAction =
  | BaseErrorAction
  | BaseSuccessAction
  | AuthAction
  | ClientAction
  | FloodAction
  | SettingsAction
  | TorrentAction;
