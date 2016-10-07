'use strict';

let NotificationCollection = require('./NotificationCollection');
let propsMap = require('../../shared/constants/propsMap');

class NotificationService {
  hasFinished(prevData, nextData) {
    return prevData.percentComplete < 100 && nextData.percentComplete === 100;
  }

  compareNewTorrentData(prevData, nextData) {
    if (this.hasFinished(prevData, nextData)) {
      NotificationCollection.addNotification({
        id: 'notification.torrent.finished',
        data: {name: nextData.name}
      });
    }
  }
}

module.exports = new NotificationService();
