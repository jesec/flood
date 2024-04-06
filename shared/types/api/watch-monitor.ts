import {WatchedDirectory} from '../Watch';

export type AddWatchOptions = Omit<WatchedDirectory, 'type' | '_id' | 'count'>;

export type ModifyWatchOptions = Partial<AddWatchOptions>;

