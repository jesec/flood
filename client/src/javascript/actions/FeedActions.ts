import axios from 'axios';

import ConfigStore from '@client/stores/ConfigStore';
import FeedStore from '@client/stores/FeedStore';

import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '@shared/types/api/feed-monitor';

const {baseURI} = ConfigStore;

const FeedActions = {
  addFeed: (options: AddFeedOptions) =>
    axios
      .put(`${baseURI}api/feed-monitor/feeds`, options)
      .then((json) => json.data)
      .then(() => {
        FeedActions.fetchFeedMonitors();
      }),

  modifyFeed: (id: string, options: ModifyFeedOptions) =>
    axios
      .patch(`${baseURI}api/feed-monitor/feeds/${id}`, options)
      .then((json) => json.data)
      .then(() => {
        FeedActions.fetchFeedMonitors();
      }),

  addRule: (options: AddRuleOptions) =>
    axios
      .put(`${baseURI}api/feed-monitor/rules`, options)
      .then((json) => json.data)
      .then(() => {
        FeedActions.fetchFeedMonitors();
      }),

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
