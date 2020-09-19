import {Dispatcher} from 'flux';

import type {AuthAuthenticationResponse, AuthVerificationResponse} from '@shared/types/Auth';

import type {ActionType} from '../constants/ActionTypes';

export interface Action {
  type: ActionType;
  data?: unknown;
  error?: Error;
  options?: unknown;
}

interface AuthLoginSuccessAction {
  type: 'AUTH_LOGIN_SUCCESS';
  data: AuthAuthenticationResponse;
}

interface AuthVerifySuccessAction {
  type: 'AUTH_VERIFY_SUCCESS';
  data: AuthVerificationResponse;
}

interface AuthRegisterSuccessAction {
  type: 'AUTH_REGISTER_SUCCESS';
  data: AuthAuthenticationResponse;
}

type Actions = Action | AuthLoginSuccessAction | AuthVerifySuccessAction | AuthRegisterSuccessAction;

class FloodDispatcher extends Dispatcher<{source: string; action: Actions}> {
  dispatchUIAction<T extends Actions>(action: T) {
    if (action.type == null) {
      console.warn('Undefined action.type', action);
    }
    this.dispatch({source: 'UI_ACTION', action});
  }

  dispatchServerAction<T extends Actions>(action: T) {
    if (action.type == null) {
      console.warn('Undefined action.type', action);
    }
    this.dispatch({source: 'SERVER_ACTION', action});
  }
}

const AppDispatcher = new FloodDispatcher();

export default AppDispatcher;
