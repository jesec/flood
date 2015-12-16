import {Dispatcher} from 'flux';

class FloodDispatcher extends Dispatcher {
  dispatchUIAction(action) {
    this.dispatch({source: 'UI_ACTION', action});
  }

  dispatchServerAction(action) {
    this.dispatch({source: 'SERVER_ACTION', action});
  }
}

let AppDispatcher = new FloodDispatcher();

export default AppDispatcher;
