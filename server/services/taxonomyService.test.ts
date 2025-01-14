import {UserInDatabase} from '@shared/schema/Auth';
import {LocationTreeNode} from '@shared/types/Taxonomy';

import TaxonomyService from '../../server/services/taxonomyService';

type LocationRecord = {[key: string]: LocationRecord | null};
const toTreeNodes = (locations: LocationRecord, separator = '/', basePath = '') =>
  Object.keys(locations).reduce((parentNodes, locationKey) => {
    const fullPath = locationKey !== '' ? basePath + separator + locationKey : locationKey;
    const subLocations = locations[locationKey];
    if (subLocations) {
      const parent = {
        directoryName: locationKey,
        fullPath: fullPath,
        children: toTreeNodes(subLocations, separator, fullPath),
        containedCount: 0,
        containedSize: 0,
      };
      for (const child of parent.children) {
        parent.containedCount += child.containedCount;
        parent.containedSize += child.containedSize;
      }
      parentNodes.push(parent);
    } else {
      parentNodes.push({
        directoryName: locationKey,
        fullPath: fullPath,
        children: [],
        containedCount: '' !== locationKey ? 1 : 0,
        containedSize: '' !== locationKey ? 10 : 0,
      });
    }
    return parentNodes;
  }, [] as LocationTreeNode[]);

describe('taxonomyService', () => {
  describe('incrementLocationCountsAndSizes() - locationTree', () => {
    for (const locationsAndExpected of [
      // No torrents
      {locations: [] as string[], expected: toTreeNodes({'': null})[0]},
      // Single root
      {
        locations: ['/mnt/dir1/file1', '/mnt/dir1/file2', '/mnt/dir2/file3', '/mnt/file4'],
        expected: toTreeNodes({
          '': {
            mnt: {dir1: {file1: null, file2: null}, dir2: {file3: null}, file4: null},
          },
        })[0],
      },
      // Multiple roots including overlapping case
      {
        locations: ['/mnt/file1', '/mnt/file2', '/mount/directory1/file3', '/Mount/directory2/file4'],
        expected: toTreeNodes({
          '': {
            mnt: {file1: null, file2: null},
            mount: {directory1: {file3: null}},
            Mount: {directory2: {file4: null}},
          },
        })[0],
      },
    ]) {
      const {locations, expected} = locationsAndExpected;

      it(`builds case-sensitive location tree correctly from ${locations}`, () => {
        const taxonomyService = new TaxonomyService({} as UserInDatabase);

        for (const location of locations) taxonomyService.incrementLocationCountsAndSizes(location, 10);

        expect(taxonomyService.taxonomy.locationTree).toMatchObject(expected);
      });
    }
  });
});
