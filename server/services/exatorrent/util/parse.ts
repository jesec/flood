import {ExatorrentClientStats} from '../types/ExatorrentCoreMethods';

export const parseClientStats = (stats: string): ExatorrentClientStats => {
  const clientStats = stats.split('}')[0].split('(torrent.ConnStats) {')[1];
  const lines = clientStats.split('\n');
  const data: Record<string, string> = {};
  for (const line of lines) {
    if (line.includes('torrent.Count')) {
      const val = line.split(': (torrent.Count) ');
      data[val[0].trim()] = val[1].slice(0, -1);
    }
  }

  return {
    bytes_written: parseInt(data['BytesWritten']),
    bytes_written_data: parseInt(data['BytesWrittenData']),
    bytes_read: parseInt(data['BytesRead']),
    bytes_read_data: parseInt(data['BytesReadData']),
    bytes_read_useful_data: parseInt(data['BytesReadUsefulData']),
    bytes_read_useful_intended_data: parseInt(data['BytesReadUsefulIntendedData']),
    chunks_written: parseInt(data['ChunksWritten']),
    chunks_read: parseInt(data['ChunksRead']),
    chunks_read_useful: parseInt(data['ChunksReadUseful']),
    chunks_read_wasted: parseInt(data['ChunksReadWasted']),
    metadata_chunks_read: parseInt(data['MetadataChunksRead']),
    pieces_dirtied_good: parseInt(data['PiecesDirtiedGood']),
    pieces_dirtied_bad: parseInt(data['PiecesDirtiedBad']),
  };
};
