'use strict';

let NotificationCollection = require('./NotificationCollection');
let propsMap = require('../../shared/constants/propsMap');

class NotificationService {
  hasError(data) {
    return data.status && data.status.indexOf(propsMap.clientStatus.error) > -1;
  }

  hasErrored(prevData, nextData) {
    return prevData && prevData.status && !this.hasError(prevData)
      && this.hasError(nextData);
  }

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

    if (this.hasErrored(prevData, nextData)) {
      let error = nextData.message ? ` (${nextData.message})` : '';

      NotificationCollection.addNotification({
        id: 'notification.torrent.errored',
        data: {name: nextData.name, error}
      });
    }
  }
}

module.exports = new NotificationService();
