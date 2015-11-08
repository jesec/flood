const initialState = {
  transfers: {
    updatedAt: 0,
    download: {
      rate: 0,
      total: 0
    },
    upload: {
      rate: 0,
      total: 0
    }
  }
};

export default function clientReducer(state = initialState, action) {
  switch (action.type) {

    case 'CLIENT_RECEIVE_TRANSFER_DATA':
      return Object.assign(
        {},
        state,
        {
          ...state,
          transfers: {
            ...state.transfers,
            updatedAt: Date.now(),
            download: {
              rate: action.payload.downloadRate,
              total: action.payload.downloadTotal
            },
            upload: {
              rate: action.payload.uploadRate,
              total: action.payload.uploadTotal
            }
          }
        }
      );

    default:
      return state;
  }
}
