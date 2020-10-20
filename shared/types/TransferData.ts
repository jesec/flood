export interface TransferSummary {
  // Global download rate
  downRate: number;
  // Download rate limit
  downThrottle: number;
  // Data downloaded this session
  downTotal: number;
  // Global upload rate
  upRate: number;
  // Upload rate limit
  upThrottle: number;
  // Data uploaded this session
  upTotal: number;
}

export type TransferDirection = 'upload' | 'download';

export type TransferData = Record<TransferDirection, number>;

export interface TransferSnapshot extends TransferData {
  numUpdates?: number;
  timestamp: number;
}

export type TransferHistory = Record<TransferDirection | 'timestamps', Array<number>>;
