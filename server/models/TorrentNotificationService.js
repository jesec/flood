'use strict';

let NotificationCollection = require('./NotificationCollection');
let torrentStatusMap = require('../../shared/constants/torrentStatusMap');

class NotificationService {
  hasFinished(prevData, nextData) {
    prevData = prevData || {};
    let status = prevData.status || [];

    return !(status.indexOf(torrentStatusMap.checking) > -1)
      && prevData.percentComplete < 100 && nextData.percentComplete === 100;
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
