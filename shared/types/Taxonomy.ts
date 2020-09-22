import type {DiffAction} from '../constants/diffActionTypes';

export interface Taxonomy {
  statusCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  trackerCounts: Record<string, number>;
}

type TaxonomyDiff<T extends keyof Taxonomy> = DiffAction<Taxonomy[T]> | null;

export interface TaxonomyDiffs {
  statusCounts: TaxonomyDiff<'statusCounts'>;
  tagCounts: TaxonomyDiff<'tagCounts'>;
  trackerCounts: TaxonomyDiff<'trackerCounts'>;
}
