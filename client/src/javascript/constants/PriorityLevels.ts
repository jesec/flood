const PriorityLevels = {
  file: {
    0: 'DONT_DOWNLOAD',
    1: 'NORMAL',
    2: 'HIGH',
  },
  torrent: {
    0: 'DONT_DOWNLOAD',
    1: 'LOW',
    2: 'NORMAL',
    3: 'HIGH',
  },
} as const;

export default PriorityLevels;
