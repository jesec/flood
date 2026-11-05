import type {TransferSummary} from '@shared/types/TransferData';

import type {SessionStatsResponse} from '../proto/rstorrent';

const toNumber = (value: bigint): number => Number(value);

export const statsToTransferSummary = (stats: SessionStatsResponse): TransferSummary => ({
  downRate: toNumber(stats.downRateBytesPerSec),
  upRate: toNumber(stats.upRateBytesPerSec),
  downTotal: toNumber(stats.downTotalBytes),
  upTotal: toNumber(stats.upTotalBytes),
});
