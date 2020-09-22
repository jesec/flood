import {Dispatcher} from 'flux';

import type {UIAction} from '../actions/UIActions';
import type {ServerAction} from '../constants/ServerActions';

type Action = UIAction | ServerAction;

class FloodDispatcher extends Dispatcher<{source: string; action: Action}> {
  dispatchUIAction<T extends UIAction>(action: T) {
    if (action.type == null) {
      console.warn('Undefined action.type', action);
    }
    this.dispatch({source: 'UI_ACTION', action});
  }

  dispatchServerAction<T extends ServerAction>(action: T) {
    if (action.type == null) {
      console.warn('Undefined action.type', action);
    }
    this.dispatch({source: 'SERVER_ACTION', action});
  }
}

const AppDispatcher = new FloodDispatcher();

export default AppDispatcher;
