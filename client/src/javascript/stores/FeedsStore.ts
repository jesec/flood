import type {Feed, Rule, Item} from '@shared/types/Feed';

import AppDispatcher from '../dispatcher/AppDispatcher';
import SettingsActions from '../actions/SettingsActions';
import BaseStore from './BaseStore';

class FeedsStoreClass extends BaseStore {
  private feeds: Array<Feed> = [];
  private rules: Array<Rule> = [];
  private items: Array<Item> = [];

  getFeeds(): Array<Feed> {
    return this.feeds;
  }

  getRules(): Array<Rule> {
    return this.rules;
  }

  getItems(): Array<Item> {
    return this.items;
  }

  handleFeedAddError(error?: Error): void {
    this.emit('SETTINGS_FEED_MONITOR_FEED_ADD_ERROR', error);
  }

  handleFeedAddSuccess(): void {
    SettingsActions.fetchFeedMonitors();
    this.emit('SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS');
  }

  handleFeedModifyError(error?: Error): void {
    this.emit('SETTINGS_FEED_MONITOR_FEED_MODIFY_ERROR', error);
  }

  handleFeedModifySuccess(): void {
    SettingsActions.fetchFeedMonitors();
    this.emit('SETTINGS_FEED_MONITOR_FEED_MODIFY_SUCCESS');
  }

  handleRuleAddError(error?: Error): void {
    this.emit('SETTINGS_FEED_MONITOR_RULE_ADD_ERROR', error);
  }

  handleRuleAddSuccess(): void {
    SettingsActions.fetchFeedMonitors();
    this.emit('SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS');
  }

  handleFeedMonitorsFetchError(error?: Error): void {
    this.emit('SETTINGS_FEED_MONITORS_FETCH_ERROR', error);
  }

  handleFeedMonitorsFetchSuccess(feedMonitors: {feeds: Array<Feed>; rules: Array<Rule>}): void {
    this.setFeeds(feedMonitors.feeds);
    this.setRules(feedMonitors.rules);
    this.emit('SETTINGS_FEED_MONITORS_FETCH_SUCCESS');
  }

  handleFeedMonitorRemoveError(id: string): void {
    this.emit('SETTINGS_FEED_MONITOR_REMOVE_ERROR', id);
  }

  handleFeedMonitorRemoveSuccess(id: string): void {
    SettingsActions.fetchFeedMonitors();
    this.emit('SETTINGS_FEED_MONITOR_REMOVE_SUCCESS', id);
  }

  handleFeedsFetchError(error?: Error): void {
    this.emit('SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR', error);
  }

  handleFeedsFetchSuccess(feeds: Array<Feed>): void {
    this.setFeeds(feeds);
    this.emit('SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS');
  }

  handleRulesFetchError(error?: Error): void {
    this.emit('SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR', error);
  }

  handleRulesFetchSuccess(rules: Array<Rule>): void {
    this.setRules(rules);
    this.emit('SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS');
  }

  handleItemsFetchError(error?: Error): void {
    this.emit('SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR', error);
  }

  handleItemsFetchSuccess(items: Array<Item>): void {
    this.items = items;
    this.emit('SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS');
  }

  setFeeds(feeds: Array<Feed>): void {
    if (feeds == null) {
      this.feeds = [];
      return;
    }

    this.feeds = [...feeds].sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
  }

  setRules(rules: Array<Rule>): void {
    if (rules == null) {
      this.rules = [];
      return;
    }

    this.rules = [...rules].sort((a, b) => {
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
      FeedsStore.handleFeedMonitorRemoveError(action.error.id);
      break;
    case 'SETTINGS_FEED_MONITOR_REMOVE_SUCCESS':
      FeedsStore.handleFeedMonitorRemoveSuccess(action.data.id);
      break;
    case 'SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR':
      FeedsStore.handleFeedsFetchError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS':
      FeedsStore.handleFeedsFetchSuccess(action.data);
      break;
    case 'SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR':
      FeedsStore.handleRulesFetchError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS':
      FeedsStore.handleRulesFetchSuccess(action.data);
      break;
    case 'SETTINGS_FEED_MONITORS_FETCH_ERROR':
      FeedsStore.handleFeedMonitorsFetchError(action.error);
      break;
    case 'SETTINGS_FEED_MONITORS_FETCH_SUCCESS':
      FeedsStore.handleFeedMonitorsFetchSuccess(action.data);
      break;
    case 'SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR':
      FeedsStore.handleItemsFetchError(action.error);
      break;
    case 'SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS':
      FeedsStore.handleItemsFetchSuccess(action.data);
      break;
    default:
      break;
  }
});

export default FeedsStore;
