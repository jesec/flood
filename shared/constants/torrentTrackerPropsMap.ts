const torrentTrackerPropsMap = {
  props: ['group', 'url', 'id', 'minInterval', 'normalInterval', 'type'],
  methods: ['t.group=', 't.url=', 't.id=', 't.min_interval=', 't.normal_interval=', 't.type='],
} as const;

export interface TorrentTracker {
  index: number;
  id: string;
  url: string;
  type: number;
  group: number;
  minInterval: number;
  normalInterval: number;
}

export default torrentTrackerPropsMap;
