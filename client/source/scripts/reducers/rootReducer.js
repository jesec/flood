import { combineReducers } from 'redux';

import client from './clientReducer';
import torrents from './torrentsReducer';
import ui from './uiReducer';

const rootReducer = combineReducers({
  client,
  torrents,
  ui
});

export default rootReducer;
