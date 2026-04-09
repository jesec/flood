/**
 * Mock FeedActions for Storybook
 * Simulates RSS feed actions without real API calls
 * Updates both MockStateStore AND MobX stores for proper component updates
 */

import FeedStore from '@client/stores/FeedStore';
import type {Feed, Item, Rule} from '@shared/types/Feed';

import mockStateStore from './MockStateStore';

const FeedActions = {
  fetchFeeds: () => {
    console.log('[MockFeedActions] Fetching feeds');
    const state = mockStateStore.getState();

    // Update MobX store with both feeds and rules
    FeedStore.handleFeedMonitorsFetchSuccess({
      feeds: state.feeds,
      rules: state.feedRules,
    });

    return Promise.resolve(state.feeds);
  },

  addFeed: ({url, label, interval}: Pick<Feed, 'url' | 'label' | 'interval'>) => {
    console.log('[MockFeedActions] Adding feed:', label, url);

    const state = mockStateStore.getState();
    const newFeed: Feed = {
      type: 'feed',
      _id: 'feed' + Date.now(),
      label,
      url,
      interval,
      count: 0,
    };

    const feeds = [...state.feeds, newFeed];
    mockStateStore.setState({feeds});

    // Update MobX store
    FeedStore.handleFeedMonitorsFetchSuccess({
      feeds,
      rules: state.feedRules,
    });

    return Promise.resolve(newFeed);
  },

  modifyFeed: (id: string, {url, label, interval}: Partial<Pick<Feed, 'url' | 'label' | 'interval'>>) => {
    console.log('[MockFeedActions] Modifying feed:', id);

    const state = mockStateStore.getState();
    const feeds = state.feeds.map((feed: Feed) => {
      if (feed._id === id) {
        return {
          ...feed,
          url: url || feed.url,
          label: label || feed.label,
          interval: interval || feed.interval,
        };
      }
      return feed;
    });

    mockStateStore.setState({feeds});

    // Update MobX store
    FeedStore.handleFeedMonitorsFetchSuccess({
      feeds,
      rules: state.feedRules,
    });

    return Promise.resolve();
  },

  removeFeed: (id: string) => {
    console.log('[MockFeedActions] Removing feed:', id);

    const state = mockStateStore.getState();
    const feeds = state.feeds.filter((f: Feed) => f._id !== id);
    mockStateStore.setState({feeds});

    // Update MobX store
    FeedStore.handleFeedMonitorsFetchSuccess({
      feeds,
      rules: state.feedRules,
    });

    return Promise.resolve();
  },

  fetchRules: () => {
    console.log('[MockFeedActions] Fetching rules');
    const state = mockStateStore.getState();

    // Update MobX store
    FeedStore.handleFeedMonitorsFetchSuccess({
      feeds: state.feeds,
      rules: state.feedRules,
    });

    return Promise.resolve(state.feedRules);
  },

  addRule: (rule: Omit<Rule, '_id' | 'type' | 'count'>) => {
    console.log('[MockFeedActions] Adding rule:', rule.label);

    const state = mockStateStore.getState();
    const newRule: Rule = {
      type: 'rule',
      ...rule,
      _id: 'rule' + Date.now(),
      count: 0,
    };

    const feedRules = [...state.feedRules, newRule];
    mockStateStore.setState({feedRules});

    // Update MobX store
    FeedStore.handleFeedMonitorsFetchSuccess({
      feeds: state.feeds,
      rules: feedRules,
    });

    return Promise.resolve(newRule);
  },

  modifyRule: (id: string, rule: Partial<Omit<Rule, '_id' | 'type'>>) => {
    console.log('[MockFeedActions] Modifying rule:', id);

    const state = mockStateStore.getState();
    const feedRules = state.feedRules.map((r: Rule) => {
      if (r._id === id) {
        return {...r, ...rule};
      }
      return r;
    });

    mockStateStore.setState({feedRules});

    // Update MobX store
    FeedStore.handleFeedMonitorsFetchSuccess({
      feeds: state.feeds,
      rules: feedRules,
    });

    return Promise.resolve();
  },

  removeRule: (id: string) => {
    console.log('[MockFeedActions] Removing rule:', id);

    const state = mockStateStore.getState();
    const feedRules = state.feedRules.filter((r: Rule) => r._id !== id);
    mockStateStore.setState({feedRules});

    // Update MobX store
    FeedStore.handleFeedMonitorsFetchSuccess({
      feeds: state.feeds,
      rules: feedRules,
    });

    return Promise.resolve();
  },

  fetchItems: ({id, search}: {id?: string; search?: string}) => {
    console.log('[MockFeedActions] Fetching items for feed:', id);

    const state = mockStateStore.getState();
    let items = [...state.feedItems];

    if (search) {
      items = items.filter((item: Item) => item.title.toLowerCase().includes(search.toLowerCase()));
    }

    // Update MobX store
    FeedStore.handleItemsFetchSuccess(items);

    return Promise.resolve(items);
  },

  addItemsToClient: (items: Item[]) => {
    console.log('[MockFeedActions] Adding items to client:', items.length);
    // In a real app, this would add torrents from feed items
    // For mocking, we just log and resolve
    return Promise.resolve();
  },
};

export default FeedActions;
