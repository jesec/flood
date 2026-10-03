import type {UserInDatabase} from '@shared/schema/Auth';
import type {TransferSummary} from '@shared/types/TransferData';
import {describe, expect, it} from 'vitest';

import HistoryService, {accumulateTotals} from './historyService';

const user = {_id: 'historyServiceTest', client: {client: 'rTorrent'}} as UserInDatabase;

// Drives the service as if the torrent client had answered a poll
const poll = async (service: HistoryService, downTotal: number, upTotal: number) => {
  const handle = (
    service as unknown as {
      handleFetchTransferSummarySuccess: (summary: TransferSummary) => Promise<void>;
      loadTotals: () => Promise<void>;
    }
  ).handleFetchTransferSummarySuccess;
  await handle({downRate: 0, upRate: 0, downTotal, upTotal});
  const {downTotal: down, upTotal: up} = service.getTransferSummary().transferSummary;
  return [down, up];
};

const start = async (client = 'rTorrent') => {
  const service = new HistoryService({...user, client: {client}} as UserInDatabase);
  await (service as unknown as {loadTotals: () => Promise<void>}).loadTotals();
  return service;
};

describe('accumulateTotals', () => {
  it('carries the previous session over when the client total drops', () => {
    const session1 = accumulateTotals({downBase: 0, upBase: 0, downLast: 0, upLast: 0}, 100, 50);
    expect(session1).toEqual({carried: false, totals: {downBase: 0, upBase: 0, downLast: 100, upLast: 50}});

    // client restarted, counters start from zero again
    const session2 = accumulateTotals(session1.totals, 10, 0);
    expect(session2).toEqual({carried: true, totals: {downBase: 100, upBase: 50, downLast: 10, upLast: 0}});
  });
});

describe('HistoryService transfer totals', () => {
  it('survive client and Flood restarts, and can be reset', async () => {
    let service = await start();
    expect(await poll(service, 100, 50)).toEqual([100, 50]);
    // torrent client restarted
    expect(await poll(service, 10, 0)).toEqual([110, 50]);
    await service.destroy(false);

    // Flood restarted, client kept running
    service = await start();
    expect(await poll(service, 20, 5)).toEqual([120, 55]);

    await service.resetTransferTotals();
    expect(service.getTransferSummary().transferSummary).toMatchObject({downTotal: 20, upTotal: 5});
    expect(await poll(service, 25, 6)).toEqual([25, 6]);
    await service.destroy(false);

    // reset is persisted too
    service = await start();
    expect(await poll(service, 30, 6)).toEqual([30, 6]);
    expect(await poll(service, 0, 0)).toEqual([30, 6]);
    await service.destroy(false);

    // switching to another torrent client starts over
    service = await start('qBittorrent');
    expect(await poll(service, 1, 2)).toEqual([1, 2]);
    await service.destroy(true);
  });
});
