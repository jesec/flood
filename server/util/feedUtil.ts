import type {FeedItem} from 'feedsub';

import regEx from '../../shared/util/regEx';

import type {AddTorrentByURLOptions} from '../../shared/types/api/torrents';
import type {Rule} from '../../shared/types/Feed';

interface PendingDownloadItems extends AddTorrentByURLOptions {
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
  const RSSEnclosures = feedItem.enclosures as Array<RSSEnclosure> | undefined;
  if (RSSEnclosures && Array.isArray(RSSEnclosures)) {
    return RSSEnclosures.reduce((urls: Array<string>, enclosure) => {
      if (enclosure.url) {
        urls.push(enclosure.url);
      }

      return urls;
    }, []);
  }

  // If we've got a Object of enclosures, use url key
  const RSSEnclosure = feedItem.enclosure as RSSEnclosure | undefined;
  if (RSSEnclosure?.url) {
    return [RSSEnclosure.url];
  }

  // If there are no enclosures, then use the link tag instead
  if (feedItem.link) {
    // remove CDATA tags around links
    const cdata = regEx.cdata.exec(feedItem.link as string);

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

        if (!isAlreadyDownloaded) {
          matchedItems.push({
            urls: torrentUrls,
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
