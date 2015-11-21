import axios from 'axios';

export function addTorrents(urls, destination) {
  return function(dispatch) {
    return axios.post('/client/add', {
        urls,
        destination
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        dispatch({
          type: 'ADD_TORRENT',
          payload: {
            response
          }
        });
      })
      .catch((error) => {
        console.error('error', error);
      });
  }
};

export function getTransferData() {
  return function(dispatch) {
    return axios.get('/client/stats')
      .then((json = {}) => {
        return json.data;
      })
      .then(transferData => {
        dispatch({
          type: 'CLIENT_RECEIVE_TRANSFER_DATA',
          payload: transferData
        });
      })
      .catch((error) => {
        console.error('error', error);
      });
  }
}

export function getTorrents() {
  return function(dispatch) {
    dispatch({
      type: 'REQUEST_TORRENTS',
      payload: {
        text: 'Begin requesting torrents.'
      }
    });
    return axios.get('/client/list')
      .then((json = {}) => {
        return json.data;
      })
      .then(torrents => {
        dispatch({
          type: 'RECEIVE_TORRENTS',
          payload: {
            torrents
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

export function getTorrentDetails(hash) {
  return function(dispatch) {
    return axios.post('/client/torrent-details', {
        hash
      })
      .then((json = {}) => {
        return json.data;
      })
      .then(torrentDetails => {
        dispatch({
          type: 'RECEIVE_TORRENT_DETAILS',
          payload: {
            hash,
            torrentDetails
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

export function startTorrent(hashes) {
  return function(dispatch) {
    return axios.post('/client/start', {
        hashes
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        dispatch({
          type: 'START_TORRENT',
          payload: {
            response
          }
        });
        dispatch(getTorrents());
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

export function stopTorrent(hashes) {
  return function(dispatch) {
    return axios.post('/client/stop', {
        hashes
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        dispatch({
          type: 'STOP_TORRENT',
          payload: {
            response
          }
        });
        dispatch(getTorrents());
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
