import classnames from'classnames';
import React from'react';

import EventTypes from '../../constants/EventTypes';
import FloodActions from '../../actions/FloodActions';
import AuthStore from '../../stores/AuthStore';

const METHODS_TO_BIND = ['handleAuthError', 'handleSubmitClick'];

export default class AuthForm extends React.Component {
  constructor() {
    super();

    this.state = {error: null}

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    AuthStore.listen(EventTypes.AUTH_LOGIN_ERROR, this.handleAuthError);
    AuthStore.listen(EventTypes.AUTH_REGISTER_ERROR, this.handleAuthError);
  }

  componentWillUnmount() {
    AuthStore.unlisten(EventTypes.AUTH_LOGIN_ERROR, this.handleAuthError);
    AuthStore.unlisten(EventTypes.AUTH_REGISTER_ERROR, this.handleAuthError);
  }

  getValue(fieldName) {
    return this.state[fieldName];
  }

  handleSubmitClick() {
    if (this.props.mode === 'login') {
      AuthStore.authenticate({
        username: this.refs.username.value,
        password: this.refs.password.value
      });
    } else {
      AuthStore.register({
        username: this.refs.username.value,
        password: this.refs.password.value
      });
    }
  }

  handleAuthError(error) {
    this.setState({error});
  }

  render() {
    let actionText = null;
    let error = null;
    let headerText = null;

    if (this.props.mode === 'login') {
      actionText = 'Log In';
      headerText = 'Login';
    } else {
      actionText = 'Create Account';
      headerText = 'Create an Account';
    }

    if (!!this.state.error) {
      error = (
        <div className="form__row form__row--error">
          <div className="form__column">
            {this.state.error}
          </div>
        </div>
      );
    }

    return (
      <div className="form form--authentication">
        <div className="form__wrapper">
          <div className="form__row form__header">
            <h1>{headerText}</h1>
          </div>
          <div className="form__row">
            <div className="form__column">
              <input className="textbox textbox--open" placeholder="Username"
                ref="username" type="text" />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column">
              <input className="textbox textbox--open" placeholder="Password"
                ref="password" type="password" />
            </div>
          </div>
          {error}
        </div>
        <div className="form__actions">
          <button className="button button--primary"
            onClick={this.handleSubmitClick}>
            {actionText}
          </button>
        </div>
      </div>
    );
  }
}
