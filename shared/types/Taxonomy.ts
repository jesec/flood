export interface LocationTreeNode {
  directoryName: string;
  fullPath: string;
  children: LocationTreeNode[];
  parent?: LocationTreeNode;
}

export interface Taxonomy {
  locationCounts: Record<string, number>;
  locationSizes: Record<string, number>;
  locationTree: LocationTreeNode[];
  statusCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  tagSizes: Record<string, number>;
  trackerCounts: Record<string, number>;
  trackerSizes: Record<string, number>;
}
