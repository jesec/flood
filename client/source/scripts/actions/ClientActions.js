import axios from 'axios';

export function addTorrent(hashes) {
  return function(dispatch) {
    return axios.post('/torrents/add', {
        hashes
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

// CLIENT_RECEIVE_TRANSFER_DATA

export function fetchTransferData() {
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

export function fetchTorrents() {
  return function(dispatch) {
    dispatch({
      type: 'REQUEST_TORRENTS',
      payload: {
        text: 'Begin requesting torrents.'
      }
    });
    return axios.get('/torrents/list')
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
        console.error('error', error);
      });
  }
}

export function startTorrent(hashes) {
  return function(dispatch) {
    return axios.post('/torrents/start', {
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
        dispatch(fetchTorrents());
      })
      .catch((error) => {
        console.error('error', error);
      });
  }
}

export function stopTorrent(hashes) {
  return function(dispatch) {
    return axios.post('/torrents/stop', {
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
        dispatch(fetchTorrents());
      })
      .catch((error) => {
        console.error('error', error);
      });
  }
}
