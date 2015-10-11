import $ from 'jquery';
import _ from 'underscore';
import assign from 'object-assign';
import {EventEmitter} from 'events';

import AppDispatcher from '../dispatcher/AppDispatcher';
import TorrentConstants from '../constants/TorrentConstants';
import UIConstants from '../constants/UIConstants';

let _torrents = [];
let _filtered = true;
let _filterText = '';
let _filterStatus = 'all';
let _sortedTorrents = [];
let _sorted = true;
let _sortCriteria = {
  property: 'added',
  direction: 'desc'
}

let TorrentStore = assign({}, EventEmitter.prototype, {

  getAll: function() {

    if (_sorted) {
      _sortedTorrents = sortTorrentList();

      if (_filtered) {
        _sortedTorrents = filterTorrentList();
      }

      return _sortedTorrents;
    } else {

      return _torrents;
    }

  },

  getSortCriteria: function() {

    if (_sorted) {
      return _sortCriteria;
    } else {
      return false;
    }
  },

  getFilterCriteria: function() {

    return _filterStatus;
  },

  emitChange: function() {
    this.emit(TorrentConstants.TORRENT_LIST_CHANGE);
  },

  emitSortChange: function() {
    this.emit(UIConstants.FILTER_SORT_CHANGE);
  },

  emitFilterChange: function() {
    this.emit(UIConstants.FILTER_STATUS_CHANGE);
  },

  addChangeListener: function(callback) {
    this.on(TorrentConstants.TORRENT_LIST_CHANGE, callback);
  },

  addSortChangeListener: function(callback) {
    this.on(UIConstants.FILTER_SORT_CHANGE, callback);
  },

  addFilterChangeListener: function(callback) {
    this.on(UIConstants.FILTER_STATUS_CHANGE, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(TorrentConstants.TORRENT_LIST_CHANGE, callback);
  },

  removeSortChangeListener: function(callback) {
    this.removeListener(UIConstants.FILTER_SORT_CHANGE, callback);
  },

  removeFilterChangeListener: function(callback) {
    this.removeListener(UIConstants.FILTER_STATUS_CHANGE, callback);
  }

});

let dispatcherIndex = AppDispatcher.register(function(action) {

  let text;

  switch(action.actionType) {

    case TorrentConstants.TORRENT_STOP_SUCCESS:
      getTorrentList();
      break;

    case TorrentConstants.TORRENT_START_SUCCESS:
      getTorrentList();
      break;

    case UIConstants.FILTER_SORT_CHANGE:
      _sortCriteria.property = action.property;
      _sortCriteria.direction = action.direction;
      TorrentStore.emitSortChange();
      TorrentStore.emitChange();
      break;

    case UIConstants.FILTER_SEARCH_CHANGE:
      _filterText = action.query;
      TorrentStore.emitChange();
      break;

    case UIConstants.FILTER_STATUS_CHANGE:
      _filterStatus = action.status;
      TorrentStore.emitChange();
      TorrentStore.emitFilterChange();
      break;

  }
});

let filterTorrentList = function() {

  let torrents = _sortedTorrents.slice();

  torrents = _.filter(torrents, function(torrent) {

    if (_filterStatus !== 'all') {
      return torrent.status.indexOf('is-' + _filterStatus) > -1;
    } else {
      return true;
    }
  });

  try {

    let queries = [];
    let searchTerms = _filterText.replace(/,/g, ' ').split(' ');

    for (let i = 0, len = searchTerms.length; i < len; i++) {
      queries.push(new RegExp(searchTerms[i], 'gi'));
    }

    torrents = _.filter(torrents, function(torrent) {
      for (let i = 0, len = queries.length; i < len; i++) {
        if (!torrent.name.match(queries[i])) {
          return false;
        }
      }
      return true;
    });

  } catch (error) {
    return torrents;
  }

  return torrents;
}

let getTorrentList = function(callback) {

  $.ajax({
    url: '/torrents/list',
    dataType: 'json',

    success: function(data) {

      _torrents = data;

      if (_sorted) {
        _sortedTorrents = sortTorrentList();
      }

      TorrentStore.emitChange();
    }.bind(this),

    error: function(xhr, status, err) {
      console.error('/torrents/list', status, err.toString());
    }.bind(this)
  });

};

let sortTorrentList = function() {

  let property = _sortCriteria.property;
  let direction = _sortCriteria.direction;
  let sortedList = _torrents.slice();

  sortedList = sortedList.sort(function(a, b) {

    let valA = a[property];
    let valB = b[property];

    if (property === 'eta') {

      // keep infinity at bottom of array when sorting by eta
      if (valA === 'Infinity' && valB !== 'Infinity') {
        return 1;
      } else if (valA !== 'Infinity' && valB === 'Infinity') {
        return -1;
      }

      // if it's not infinity, compare the second as numbers
      if (valA !== 'Infinity') {
        valA = Number(valA.seconds);
      }

      if (valB !== 'Infinity') {
        valB = Number(valB.seconds);
      }

    } else if (property === 'name') {

      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    } else {

      valA = Number(valA);
      valB = Number(valB);
    }

    if (direction === 'asc') {

      if (valA > valB) {
        return 1;
      }

      if (valA < valB) {
        return -1;
      }

    } else {

      if (valA > valB) {
        return -1;
      }

      if (valA < valB) {
        return 1;
      }

    }

    return 0;
  });

  return sortedList;
};

getTorrentList();
setInterval(getTorrentList, 5000);

export default TorrentStore;
