import {Dispatcher} from 'flux';

import type {ActionType} from '../constants/ActionTypes';

export interface Action {
  type: ActionType;
  data?: unknown;
  error?: Error;
  options?: unknown;
}

class FloodDispatcher extends Dispatcher<{source: string; action: Action}> {
  dispatchUIAction(action: Action) {
    if (action.type == null) {
      console.warn('Undefined action.type', action);
    }
    this.dispatch({source: 'UI_ACTION', action});
  }

  dispatchServerAction(action: Action) {
    if (action.type == null) {
      console.warn('Undefined action.type', action);
    }
    this.dispatch({source: 'SERVER_ACTION', action});
  }
}

const AppDispatcher = new FloodDispatcher();

export default AppDispatcher;
