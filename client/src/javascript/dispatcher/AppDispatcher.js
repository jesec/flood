import {Dispatcher} from 'flux';

class FloodDispatcher extends Dispatcher {
  dispatchUIAction(action) {
    if (action.type == null) {
      console.warn('Undefined action.type', action);
    }
    this.dispatch({source: 'UI_ACTION', action});
  }

  dispatchServerAction(action) {
    if (action.type == null) {
      console.warn('Undefined action.type', action);
    }
    this.dispatch({source: 'SERVER_ACTION', action});
  }
}

const AppDispatcher = new FloodDispatcher();

export default AppDispatcher;
