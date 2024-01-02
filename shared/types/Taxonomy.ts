export interface LocationTreeNode {
  directoryName: string;
  fullPath: string;
  children: LocationTreeNode[];
  containedCount: number;
  containedSize: number;
}

export interface Taxonomy {
  locationTree: LocationTreeNode;
  statusCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  tagSizes: Record<string, number>;
  trackerCounts: Record<string, number>;
  trackerSizes: Record<string, number>;
}
