import {describe, expect, it} from 'vitest';

import {getTorrentStatusFromProperties} from './torrentPropertiesUtil';

const baseProperties = {
  isHashing: false,
  isComplete: true,
  isOpen: true,
  upRate: 0,
  downRate: 0,
  state: 1,
  message: '',
};

describe('getTorrentStatusFromProperties', () => {
  it('maps Tracker: messages to warning instead of error', () => {
    expect(
      getTorrentStatusFromProperties({
        ...baseProperties,
        message: 'Tracker: [v4 : network error: ETIMEDOUT  |  v6 : network error: ENETUNREACH]',
      }),
    ).toEqual(['complete', 'seeding', 'warning', 'inactive']);
  });

  it('keeps non-tracker messages as error', () => {
    expect(
      getTorrentStatusFromProperties({
        ...baseProperties,
        isComplete: false,
        isOpen: false,
        state: 0,
        message: 'File chunk error: Permission denied',
      }),
    ).toEqual(['stopped', 'error', 'inactive']);
  });

  it('omits error and warning when message is empty', () => {
    expect(getTorrentStatusFromProperties({...baseProperties, upRate: 1024})).toEqual([
      'complete',
      'seeding',
      'active',
    ]);
  });
});
