import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import SettingsActions from '../actions/SettingsActions';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';

class FeedsStoreClass extends BaseStore {
  constructor() {
    super();
    this.feeds = [];
    this.rules = [];
    this.items = [];
  }

  addFeed(feed) {
    SettingsActions.addFeed(feed);
  }

  modifyFeed(id, feed) {
    SettingsActions.modifyFeed(id, feed);
  }

  addRule(feed) {
    SettingsActions.addRule(feed);
  }

  fetchFeedMonitors(query) {
    SettingsActions.fetchFeedMonitors(query);
  }

  fetchFeeds(query) {
    SettingsActions.fetchFeeds(query);
  }

  fetchItems(query) {
    SettingsActions.fetchItems(query);
  }

  fetchRules(query) {
    SettingsActions.fetchRules(query);
  }

  removeFeed(id) {
    SettingsActions.removeFeedMonitor(id);
  }

  removeRule(id) {
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

  handleFeedAddError(error) {
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_FEED_ADD_ERROR, error);
  }

  handleFeedAddSuccess() {
    this.fetchFeedMonitors();
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS);
  }

  handleFeedModifyError(error) {
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_FEED_MODIFY_ERROR, error);
  }

  handleFeedModifySuccess() {
    this.fetchFeedMonitors();
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_FEED_MODIFY_SUCCESS);
  }

  handleRuleAddError(error) {
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_RULE_ADD_ERROR, error);
  }

  handleRuleAddSuccess() {
    this.fetchFeedMonitors();
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS);
  }

  handleFeedMonitorsFetchError(error) {
    this.emit(EventTypes.SETTINGS_FEED_MONITORS_FETCH_ERROR, error);
  }

  handleFeedMonitorsFetchSuccess(feedMonitors) {
    this.setFeeds(feedMonitors.feeds);
    this.setRules(feedMonitors.rules);
    this.emit(EventTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS);
  }

  handleFeedMonitorRemoveError(id) {
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_REMOVE_ERROR, id);
  }

  handleFeedMonitorRemoveSuccess(id) {
    this.fetchFeedMonitors();
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_REMOVE_SUCCESS, id);
  }

  handleFeedsFetchError(error) {
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR, error);
  }

  handleFeedsFetchSuccess(feeds) {
    this.setFeeds(feeds);
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS);
  }

  handleRulesFetchError(error) {
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR, error);
  }

  handleRulesFetchSuccess(rules) {
    this.setRules(rules);
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS);
  }

  handleItemsFetchError(error) {
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR, error);
  }

  handleItemsFetchSuccess(items) {
    this.items = items;
    this.emit(EventTypes.SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS);
  }

  setItems(type, items) {
    if (items == null) {
      this[type] = [];
      return;
    }

    this[type] = items.sort((a, b) => a.label.localeCompare(b.label));
  }

  setFeeds(feeds) {
    this.setItems('feeds', feeds);
  }

  setRules(rules) {
    this.setItems('rules', rules);
  }
}

const FeedsStore = new FeedsStoreClass();

FeedsStore.dispatcherID = AppDispatcher.register(payload => {
  const {action} = payload;

  switch (action.type) {
    case ActionTypes.SETTINGS_FEED_MONITOR_FEED_ADD_ERROR:
      FeedsStore.handleFeedAddError(action.error);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS:
      FeedsStore.handleFeedAddSuccess();
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_FEED_MODIFY_ERROR:
      FeedsStore.handleFeedModifyError(action.error);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_FEED_MODIFY_SUCCESS:
      FeedsStore.handleFeedModifySuccess();
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_RULE_ADD_ERROR:
      FeedsStore.handleRuleAddError(action.error);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS:
      FeedsStore.handleRuleAddSuccess();
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_REMOVE_ERROR:
      FeedsStore.handleFeedMonitorRemoveError(action.error.id);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_REMOVE_SUCCESS:
      FeedsStore.handleFeedMonitorRemoveSuccess(action.data.id);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR:
      FeedsStore.handleFeedsFetchError(action.error);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS:
      FeedsStore.handleFeedsFetchSuccess(action.data);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR:
      FeedsStore.handleRulesFetchError(action.error);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS:
      FeedsStore.handleRulesFetchSuccess(action.data);
      break;
    case ActionTypes.SETTINGS_FEED_MONITORS_FETCH_ERROR:
      FeedsStore.handleFeedMonitorsFetchError(action.error);
      break;
    case ActionTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS:
      FeedsStore.handleFeedMonitorsFetchSuccess(action.data);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR:
      FeedsStore.handleItemsFetchError(action.error);
      break;
    case ActionTypes.SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS:
      FeedsStore.handleItemsFetchSuccess(action.data);
      break;
    default:
      break;
  }
});

export default FeedsStore;
