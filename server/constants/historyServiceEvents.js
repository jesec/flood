import historySnapshotTypes from '../../shared/constants/historySnapshotTypes';
import objectUtil from '../../shared/util/objectUtil';

const torrentServiceEvents = [
  'FETCH_TRANSFER_SUMMARY_ERROR',
  'FETCH_TRANSFER_SUMMARY_SUCCESS',
  'TRANSFER_SUMMARY_DIFF_CHANGE',
].concat(
  // Create an array of event types based on the available snapshots.
  Object.keys(historySnapshotTypes).reduce((accumulator, snapshotType) => {
    accumulator.push(`${snapshotType}_SNAPSHOT_FULL_UPDATE`, `${snapshotType}_SNAPSHOT_DIFF_CHANGE`);

    return accumulator;
  }, []),
);

export default objectUtil.createSymbolMapFromArray(torrentServiceEvents);
