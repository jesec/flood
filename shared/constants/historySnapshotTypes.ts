const historySnapshotTypes = ['FIVE_MINUTE', 'THIRTY_MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'] as const;

export default historySnapshotTypes;
export type HistorySnapshot = typeof historySnapshotTypes[number];
