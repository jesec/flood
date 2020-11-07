export interface TransferSummary {
  // Global download rate in B/s
  downRate: number;
  // Data downloaded this session in bytes
  downTotal: number;
  // Global upload rate in B/s
  upRate: number;
  // Data uploaded this session in bytes
  upTotal: number;
}

export type TransferDirection = 'upload' | 'download';

export type TransferData = Record<TransferDirection, number>;

export interface TransferSnapshot extends TransferData {
  numUpdates?: number;
  timestamp: number;
}

export type TransferHistory = Record<TransferDirection | 'timestamps', Array<number>>;
