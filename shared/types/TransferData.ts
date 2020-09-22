import {DiffAction} from '@shared/constants/diffActionTypes';

export interface TransferSummary {
  downRate: number;
  downThrottle: number;
  downTotal: number;
  upRate: number;
  upThrottle: number;
  upTotal: number;
}

export type TransferSummaryDiff = DiffAction<Partial<TransferSummary>>;

export type TransferDirection = 'upload' | 'download';

export type TransferData = Record<TransferDirection, number>;

export interface TransferSnapshot extends TransferData {
  numUpdates?: number;
  timestamp: number;
}

export type TransferHistory = Record<TransferDirection | 'timestamps', Array<number>>;
