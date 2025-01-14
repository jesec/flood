import type {FeedItem} from 'feedsub';

import type {AddTorrentByURLOptions} from '../../shared/schema/api/torrents';
import type {Rule} from '../../shared/types/Feed';
import {cdata as matchCDATA} from '../../shared/util/regEx';

interface PendingDownloadItems
  extends Required<Pick<AddTorrentByURLOptions, 'urls' | 'destination' | 'tags' | 'start'>> {
  matchTitle: string;
  ruleID: string;
  ruleLabel: string;
}

interface RSSEnclosure {
  url?: string;
  length?: number;
  type?: string;
}

// TODO: Allow users to specify which key contains the URLs.
export const getTorrentUrlsFromFeedItem = (feedItem: FeedItem): Array<string> => {
  // If we've got an Array of enclosures, we'll iterate over the values and
  // look for the url key.
  const RSSEnclosures = feedItem.enclosures as unknown as Array<RSSEnclosure> | undefined;
  if (RSSEnclosures && Array.isArray(RSSEnclosures)) {
    return RSSEnclosures.reduce((urls: Array<string>, enclosure) => {
      if (typeof enclosure.url === 'string') {
        urls.push(enclosure.url);
      }

      return urls;
    }, []);
  }

  // If we've got a Object of enclosures, use url key
  const RSSEnclosure = feedItem.enclosure as RSSEnclosure | undefined;
  if (typeof RSSEnclosure?.url === 'string') {
    return [RSSEnclosure.url];
  }

  // If there are no enclosures, then use the link tag instead
  if (feedItem.link) {
    // remove CDATA tags around links
    const cdata = matchCDATA.exec(feedItem.link as string);

    if (cdata && cdata[1]) {
      return [cdata[1]];
    }

    return [feedItem.link as string];
  }

  return [];
};

export const getFeedItemsMatchingRules = (
  feedItems: Array<FeedItem>,
  rules: Array<Rule>,
): Array<PendingDownloadItems> => {
  return feedItems.reduce((matchedItems: Array<PendingDownloadItems>, feedItem) => {
    rules.forEach((rule) => {
      const matchField = rule.field ? (feedItem[rule.field] as string) : (feedItem.title as string);
      const isMatched = new RegExp(rule.match, 'gi').test(matchField);
      const isExcluded = rule.exclude !== '' && new RegExp(rule.exclude, 'gi').test(matchField);

      if (isMatched && !isExcluded) {
        const torrentUrls = getTorrentUrlsFromFeedItem(feedItem);
        const isAlreadyDownloaded = matchedItems.some((matchedItem) =>
          torrentUrls.every((url) => matchedItem.urls.includes(url)),
        );

        if (!isAlreadyDownloaded && torrentUrls[0] != null) {
          matchedItems.push({
            urls: torrentUrls as [string, ...string[]],
            tags: rule.tags,
            matchTitle: feedItem.title as string,
            ruleID: rule._id,
            ruleLabel: rule.label,
            destination: rule.destination,
            start: rule.startOnLoad,
          });
        }
      }
    });

    return matchedItems;
  }, []);
};
