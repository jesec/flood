import {browserHistory} from 'react-router';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import AuthStore from '../../stores/AuthStore';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicator from '../ui/LoadingIndicator';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'handleVerifyError',
  'handleVerifySuccess',
  'handleLoginError',
  'handleLoginSuccess',
  'handleRegisterSuccess',
  'handleUIDependenciesLoaded'
];

class Application extends React.Component {
  constructor() {
    super();

    this.state = {
      authStatusDetermined: false,
      isAuthenticated: false,
      dependenciesLoaded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    AuthStore.listen(EventTypes.AUTH_REGISTER_SUCCESS,
      this.handleRegisterSuccess);
    AuthStore.listen(EventTypes.AUTH_LOGIN_ERROR,
      this.handleLoginError);
    AuthStore.listen(EventTypes.AUTH_LOGIN_SUCCESS,
      this.handleLoginSuccess);
    AuthStore.listen(EventTypes.AUTH_VERIFY_ERROR,
      this.handleVerifyError);
    AuthStore.listen(EventTypes.AUTH_VERIFY_SUCCESS,
      this.handleVerifySuccess);
    UIStore.listen(EventTypes.UI_DEPENDENCIES_LOADED,
      this.handleUIDependenciesLoaded);
    AuthStore.verify();
  }

  componentWillUnmount() {
    AuthStore.unlisten(EventTypes.AUTH_REGISTER_SUCCESS,
      this.handleRegisterSuccess);
    AuthStore.unlisten(EventTypes.AUTH_LOGIN_ERROR,
      this.handleLoginError);
    AuthStore.unlisten(EventTypes.AUTH_LOGIN_SUCCESS,
      this.handleLoginSuccess);
    AuthStore.unlisten(EventTypes.AUTH_VERIFY_ERROR,
      this.handleVerifyError);
    AuthStore.unlisten(EventTypes.AUTH_VERIFY_SUCCESS,
      this.handleVerifySuccess);
    UIStore.unlisten(EventTypes.UI_DEPENDENCIES_LOADED,
      this.handleUIDependenciesLoaded);
  }

  handleVerifySuccess(data) {
    if (data.initialUser) {
      this.setState({authStatusDetermined: true, isAuthenticated: false});
      browserHistory.push('register');
    } else {
      this.setState({authStatusDetermined: true, isAuthenticated: true});
      browserHistory.push('list');
    }
  }

  handleVerifyError(error) {
    this.setState({authStatusDetermined: true, isAuthenticated: false});
    browserHistory.push('login');
  }

  handleLoginError() {
    this.setState({authStatusDetermined: true, isAuthenticated: false});
    browserHistory.push('login');
  }

  handleLoginSuccess() {
    this.setState({authStatusDetermined: true, isAuthenticated: true});
    browserHistory.push('list');
  }

  handleRegisterSuccess() {
    this.setState({authStatusDetermined: true, isAuthenticated: true});
    browserHistory.push('list');
  }

  handleUIDependenciesLoaded() {
    this.setState({dependenciesLoaded: true});
  }

  isLoading() {
    if (!this.state.authStatusDetermined) {
      return true;
    }

    if (this.state.authStatusDetermined && !this.state.isAuthenticated) {
      return false;
    }

    if (this.state.authStatusDetermined && this.state.isAuthenticated && !this.state.dependenciesLoaded) {
      return true;
    }

    return false;
  }

  render() {
    let loadingIndicator;

    if (this.isLoading()) {
      loadingIndicator = (
        <div className="application__loading-indicator">
          <LoadingIndicator inverse={true} />
        </div>
      );
    }

    return (
      <div className="application">
        <CSSTransitionGroup
          className="application__loading-indicator__wrapper"
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
          transitionName="application__loading-indicator">
          {loadingIndicator}
        </CSSTransitionGroup>
        {this.props.children}
      </div>
    );
  }
}

Application.propTypes = {
  children: React.PropTypes.node
};

export default Application;
