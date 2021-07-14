export interface Taxonomy {
  statusCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  tagSizes: Record<string, number>;
  trackerCounts: Record<string, number>;
  trackerSizes: Record<string, number>;
}
