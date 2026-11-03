import type {FloodSettings} from '@shared/types/FloodSettings';
import {describe, expect, it} from 'vitest';

import type SettingService from '../services/settingService';
import {getTagsWithAutoTags} from './torrentTagUtil';

const mockSettingService = (settings: Partial<FloodSettings>) =>
  ({get: async () => settings}) as unknown as SettingService;

describe('getTagsWithAutoTags', () => {
  it('returns requested tags when no auto tags are configured', async () => {
    expect(await getTagsWithAutoTags(mockSettingService({}), 'alice', ['movies'])).toEqual(['movies']);
  });

  it('appends auto tags and username after requested tags', async () => {
    const settingService = mockSettingService({autoTags: ['flood', 'movies'], autoTagWithUsername: true});

    expect(await getTagsWithAutoTags(settingService, 'alice', ['movies'])).toEqual(['movies', 'flood', 'alice']);
  });

  it('adds auto tags when no tags are requested', async () => {
    const settingService = mockSettingService({autoTagWithUsername: true});

    expect(await getTagsWithAutoTags(settingService, 'alice')).toEqual(['alice']);
  });

  it('strips commas from username', async () => {
    const settingService = mockSettingService({autoTagWithUsername: true});

    expect(await getTagsWithAutoTags(settingService, 'a,b', [])).toEqual(['ab']);
  });

  it('falls back to requested tags when settings cannot be read', async () => {
    const settingService = {get: async () => Promise.reject(new Error('db'))} as unknown as SettingService;

    expect(await getTagsWithAutoTags(settingService, 'alice', ['movies'])).toEqual(['movies']);
  });
});
