'use strict';

let client = require('../models/client');
let history = require('../models/history');

class PollService {
  init() {
    client.startPollingTorrents();
    history.startPolling();
  }
}

module.exports = new PollService();
