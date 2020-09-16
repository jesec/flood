import objectUtil from '../../shared/util/objectUtil';

const torrentServiceEvents = ['FETCH_TORRENT_LIST_ERROR', 'FETCH_TORRENT_LIST_SUCCESS', 'TORRENT_LIST_DIFF_CHANGE'];

export default objectUtil.createSymbolMapFromArray(torrentServiceEvents);
