import type {TransferHistorySchema} from '../schema/TransferData';

export interface TransferSummary {
  // Global download rate in B/s
  downRate: number;
  // Data downloaded in bytes, accumulated across torrent client sessions
  downTotal: number;
  // Global upload rate in B/s
  upRate: number;
  // Data uploaded in bytes, accumulated across torrent client sessions
  upTotal: number;
}

export type TransferDirection = 'upload' | 'download';

export type TransferData = Record<TransferDirection, number>;

export interface TransferSnapshot extends TransferData {
  numUpdates?: number;
  timestamp: number;
}

export type TransferHistory = TransferHistorySchema;
