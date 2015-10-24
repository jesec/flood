import axios from 'axios';

export function fetchTorrents() {
  return function(dispatch) {
    dispatch(requestTorrents());
    return axios.get('/torrents/list')
      .then((json = {}) => {
        return json.data;
      })
      .then((torrents) => {
        dispatch(receiveTorrents(torrents));
      })
      .catch((error) => {
        console.error('error', error);
      });
  }
}

function receiveTorrents(torrents) {
  return {
    type: 'RECEIVE_TORRENTS',
    payload: {
      text: 'Finished requesting torrents.',
      torrents
    }
  };
}

function requestTorrents() {
  return {
    type: 'REQUEST_TORRENTS',
    payload: {
      text: 'Begin requesting torrents.'
    }
  };
}
