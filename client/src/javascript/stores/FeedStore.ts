import {makeAutoObservable} from 'mobx';

import type {Feed, Rule, Item} from '@shared/types/Feed';

class FeedStore {
  feeds: Array<Feed> = [];
  rules: Array<Rule> = [];
  items: Array<Item> = [];

  constructor() {
    makeAutoObservable(this);
  }

  setFeeds(feeds: Array<Feed>): void {
    if (feeds == null) {
      this.feeds = [];
      return;
    }

    this.feeds = [...feeds].sort((a, b) => a.label.localeCompare(b.label));
  }

  setRules(rules: Array<Rule>): void {
    if (rules == null) {
      this.rules = [];
      return;
    }

    this.rules = [...rules].sort((a, b) => a.label.localeCompare(b.label));
  }

  handleFeedMonitorsFetchSuccess(feedMonitors: {feeds: Array<Feed>; rules: Array<Rule>}): void {
    this.setFeeds(feedMonitors.feeds);
    this.setRules(feedMonitors.rules);
  }

  handleItemsFetchSuccess(items: Array<Item>): void {
    this.items = items;
  }
}

export default new FeedStore();
