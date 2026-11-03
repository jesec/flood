import type {FloodSettings} from '@shared/types/FloodSettings';

import type SettingService from '../services/settingService';

/**
 * Merges the user's automatic tags (see `autoTags` and `autoTagWithUsername`
 * settings) into the requested tags. Requested tags keep their order, so the
 * first tag still determines the preferred destination.
 */
export const getTagsWithAutoTags = async (
  settingService: SettingService,
  username: string,
  tags: Array<string> = [],
): Promise<Array<string>> => {
  const {autoTags, autoTagWithUsername} = await settingService.get(null).catch(() => ({}) as Partial<FloodSettings>);

  const extraTags = [...(autoTags ?? [])];
  if (autoTagWithUsername) {
    // Tags cannot contain commas
    extraTags.push(username.replace(/,/g, ''));
  }

  return [...new Set([...tags, ...extraTags])].filter((tag) => tag.length > 0);
};
