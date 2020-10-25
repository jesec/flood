import axios from 'axios';

import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '@shared/types/api/feed-monitor';

import ConfigStore from '../stores/ConfigStore';
import FeedStore from '../stores/FeedStore';

const baseURI = ConfigStore.getBaseURI();

const FeedActions = {
  addFeed: (options: AddFeedOptions) =>
    axios
      .put(`${baseURI}api/feed-monitor/feeds`, options)
      .then((json) => json.data)
      .then(
        () => {
          FeedActions.fetchFeedMonitors();
        },
        () => {
          // do nothing.
        },
      ),

  modifyFeed: (id: string, options: ModifyFeedOptions) =>
    axios
      .patch(`${baseURI}api/feed-monitor/feeds/${id}`, options)
      .then((json) => json.data)
      .then(
        () => {
          FeedActions.fetchFeedMonitors();
        },
        () => {
          // do nothing.
        },
      ),

  addRule: (options: AddRuleOptions) =>
    axios
      .put(`${baseURI}api/feed-monitor/rules`, options)
      .then((json) => json.data)
      .then(
        () => {
          FeedActions.fetchFeedMonitors();
        },
        () => {
          // do nothing.
        },
      ),

  fetchFeedMonitors: () =>
    axios
      .get(`${baseURI}api/feed-monitor`)
      .then((json) => json.data)
      .then(
        (data) => {
          FeedStore.handleFeedMonitorsFetchSuccess(data);
        },
        () => {
          // do nothing.
        },
      ),

  fetchItems: ({id, search}: {id: string; search: string}) =>
    axios
      .get(`${baseURI}api/feed-monitor/feeds/${id}/items`, {
        params: {
          search,
        },
      })
      .then((json) => json.data)
      .then(
        (data) => {
          FeedStore.handleItemsFetchSuccess(data);
        },
        () => {
          // do nothing.
        },
      ),

  removeFeedMonitor: (id: string) =>
    axios
      .delete(`${baseURI}api/feed-monitor/${id}`)
      .then((json) => json.data)
      .then(
        () => {
          FeedActions.fetchFeedMonitors();
        },
        () => {
          // do nothing.
        },
      ),
} as const;

export default FeedActions;
