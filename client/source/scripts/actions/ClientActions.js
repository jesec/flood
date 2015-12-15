import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

const ClientActions = {
  fetchTransferData: function() {
    return axios.get('/client/stats')
      .then((json = {}) => {
        return json.data;
      })
      .then((transferData) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TRANSFER_DATA_SUCCESS,
          data: {
            transferData
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TRANSFER_DATA_ERROR,
          data: {
            error
          }
        });
      });
  }
};

export default ClientActions;
