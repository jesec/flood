import {beforeEach, describe, expect, it} from 'vitest';

import type {Taxonomy} from '@shared/types/Taxonomy';

import TorrentFilterStore from './TorrentFilterStore';

const baseTaxonomy: Taxonomy = {
  locationTree: {directoryName: '', fullPath: '', children: [], containedCount: 0, containedSize: 0},
  statusCounts: {},
  statusSizes: {'': 0},
  tagCounts: {},
  tagSizes: {},
  trackerCounts: {},
  trackerSizes: {},
};

describe('TorrentFilterStore', () => {
  beforeEach(() => {
    TorrentFilterStore.taxonomy = {...baseTaxonomy};
  });

  it('defaults statusSizes when missing from a full update', () => {
    const taxonomyMissingSizes = {
      ...baseTaxonomy,
      statusSizes: undefined,
    } satisfies Partial<Taxonomy>;

    TorrentFilterStore.handleTorrentTaxonomyFullUpdate(taxonomyMissingSizes);

    expect(TorrentFilterStore.taxonomy.statusSizes['']).toBe(0);
  });
});
