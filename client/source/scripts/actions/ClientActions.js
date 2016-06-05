import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

const ClientActions = {
  setThrottle: (direction, throttle) => {
    return axios.put('/client/settings/speed-limits', {
        direction,
        throttle
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((transferData) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_THROTTLE_SUCCESS,
          data: {
            transferData
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_THROTTLE_ERROR,
          data: {
            error
          }
        });
      });
  }
};

export default ClientActions;
