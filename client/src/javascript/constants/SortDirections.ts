// Overwrite initial sort direction (ascending)

const SortDirections: Record<string, 'asc' | 'desc'> = {
  dateAdded: 'desc',
  dateFinished: 'desc',
  downRate: 'desc',
  downTotal: 'desc',
  upRate: 'desc',
  upTotal: 'desc',
};

export default SortDirections;
