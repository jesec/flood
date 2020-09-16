import AppDispatcher from '../dispatcher/AppDispatcher';
import SettingsActions from '../actions/SettingsActions';
import BaseStore from './BaseStore';

export interface Feed {
  _id?: string;
  type?: 'feed';
  label: string;
  url: string;
  interval: number;
  count?: number;
}

export interface Rule {
  _id?: string;
  type?: 'rule';
  label: string;
  feedID: string;
  field?: string;
  match: string;
  exclude: string;
  destination: string;
  tags: Array<string>;
  startOnLoad: boolean;
  useBasePath?: boolean;
  count?: number;
}

export interface Item {
  title: string;
  link: string;
}

export type Feeds = Array<Feed>;
export type Rules = Array<Rule>;
export type Items = Array<Item>;

class FeedsStoreClass extends BaseStore {
  feeds: Feeds = [];
  rules: Rules = [];
  items: Items = [];

  addFeed(feed: Feed) {
    SettingsActions.addFeed(feed);
  }

  modifyFeed(id: Feed['_id'], feed: Feed) {
    SettingsActions.modifyFeed(id, feed);
  }

  addRule(rule: Rule) {
    SettingsActions.addRule(rule);
  }

  fetchFeedMonitors(query?: string) {
    SettingsActions.fetchFeedMonitors(query);
  }

  fetchFeeds(query: string) {
    SettingsActions.fetchFeeds(query);
  }

  fetchItems(query: {params: {id: string; search: string}}) {
    SettingsActions.fetchItems(query);
  }

  fetchRules(query: string) {
    SettingsActions.fetchRules(query);
  }

  removeFeed(id: Feed['_id']) {
    SettingsActions.removeFeedMonitor(id);
  }

  removeRule(id: Rule['_id']) {
    SettingsActions.removeFeedMonitor(id);
  }

  getFeeds() {
    return this.feeds;
  }

  getRules() {
    return this.rules;
  }

  getItems() {
    return this.items;
  }

  handleFeedAddError(error?: Error) {
    this.emit('SETTINGS_FEED_MONITOR_FEED_ADD_ERROR', error);
  }

  handleFeedAddSuccess() {
    this.fetchFeedMonitors();
    this.emit('SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS');
  }

  handleFeedModifyError(error?: Error) {
    this.emit('SETTINGS_FEED_MONITOR_FEED_MODIFY_ERROR', error);
  }

  handleFeedModifySuccess() {
    this.fetchFeedMonitors();
    this.emit('SETTINGS_FEED_MONITOR_FEED_MODIFY_SUCCESS');
  }

  handleRuleAddError(error?: Error) {
    this.emit('SETTINGS_FEED_MONITOR_RULE_ADD_ERROR', error);
  }

  handleRuleAddSuccess() {
    this.fetchFeedMonitors();
    this.emit('SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS');
  }

  handleFeedMonitorsFetchError(error?: Error) {
    this.emit('SETTINGS_FEED_MONITORS_FETCH_ERROR', error);
  }

  handleFeedMonitorsFetchSuccess(feedMonitors: {feeds: Feeds; rules: Rules}) {
    this.setFeeds(feedMonitors.feeds);
    this.setRules(feedMonitors.rules);
    this.emit('SETTINGS_FEED_MONITORS_FETCH_SUCCESS');
  }

  handleFeedMonitorRemoveError(id: string) {
    this.emit('SETTINGS_FEED_MONITOR_REMOVE_ERROR', id);
  }

  handleFeedMonitorRemoveSuccess(id: string) {
    this.fetchFeedMonitors();
    this.emit('SETTINGS_FEED_MONITOR_REMOVE_SUCCESS', id);
  }

  handleFeedsFetchError(error?: Error) {
    this.emit('SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR', error);
  }

  handleFeedsFetchSuccess(feeds: Feeds) {
    this.setFeeds(feeds);
    this.emit('SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS');
  }

  handleRulesFetchError(error?: Error) {
    this.emit('SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR', error);
  }

  handleRulesFetchSuccess(rules: Rules) {
    this.setRules(rules);
    this.emit('SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS');
  }

  handleItemsFetchError(error?: Error) {
    this.emit('SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR', error);
  }

  handleItemsFetchSuccess(items: Items) {
    this.items = items;
    this.emit('SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS');
  }

  setFeeds(feeds: Feeds) {
    if (feeds == null) {
      this.feeds = [];
      return;
    }

    this.feeds = feeds.sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
  }

  setRules(rules: Rules) {
    if (rules == null) {
      this.rules = [];
      return;
    }

    this.rules = rules.sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
  }
}

const FeedsStore = new FeedsStoreClass();

FeedsStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case 'SETTINGS_FEED_MONITOR_FEED_ADD_ERROR':
      FeedsStore.handleFeedAddError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS':
      FeedsStore.handleFeedAddSuccess();
      break;
    case 'SETTINGS_FEED_MONITOR_FEED_MODIFY_ERROR':
      FeedsStore.handleFeedModifyError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_FEED_MODIFY_SUCCESS':
      FeedsStore.handleFeedModifySuccess();
      break;
    case 'SETTINGS_FEED_MONITOR_RULE_ADD_ERROR':
      FeedsStore.handleRuleAddError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS':
      FeedsStore.handleRuleAddSuccess();
      break;
    case 'SETTINGS_FEED_MONITOR_REMOVE_ERROR':
      FeedsStore.handleFeedMonitorRemoveError((action.error as Error & {id: string}).id);
      break;
    case 'SETTINGS_FEED_MONITOR_REMOVE_SUCCESS':
      FeedsStore.handleFeedMonitorRemoveSuccess((action.data as {id: string}).id);
      break;
    case 'SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR':
      FeedsStore.handleFeedsFetchError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS':
      FeedsStore.handleFeedsFetchSuccess(action.data as Feeds);
      break;
    case 'SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR':
      FeedsStore.handleRulesFetchError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS':
      FeedsStore.handleRulesFetchSuccess(action.data as Rules);
      break;
    case 'SETTINGS_FEED_MONITORS_FETCH_ERROR':
      FeedsStore.handleFeedMonitorsFetchError(action.error);
      break;
    case 'SETTINGS_FEED_MONITORS_FETCH_SUCCESS':
      FeedsStore.handleFeedMonitorsFetchSuccess(action.data as {feeds: Feeds; rules: Rules});
      break;
    case 'SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR':
      FeedsStore.handleItemsFetchError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS':
      FeedsStore.handleItemsFetchSuccess(action.data as Items);
      break;
    default:
      break;
  }
});

export default FeedsStore;
