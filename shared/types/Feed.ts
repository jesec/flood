export interface Feed {
  type: 'feed';
  _id: string;
  label: string;
  url: string;
  interval: number;
  count?: number;
}

export interface Rule {
  type: 'rule';
  _id: string;
  label: string;
  feedID: string;
  field?: string;
  match: string;
  exclude: string;
  destination: string;
  tags: Array<string>;
  startOnLoad: boolean;
  isBasePath?: boolean;
  count?: number;
}

export interface MatchedTorrents {
  type: 'matchedTorrents';
  _id: string;
  urls: Array<string>;
}

export interface Item {
  title: string;
  torrentURLs: Array<string>;
}
