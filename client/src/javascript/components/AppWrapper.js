import {browserHistory} from 'react-router';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
import React from 'react';

import AuthStore from '../stores/AuthStore';
import Checkmark from './icons/Checkmark';
import ClientActions from '../actions/ClientActions';
import ClientConnectionInterruption from './general/ClientConnectionInterruption';
import ClientStatusStore from '../stores/ClientStatusStore';
import EventTypes from '../constants/EventTypes';
import FloodActions from '../actions/FloodActions';
import LoadingIndicator from './general/LoadingIndicator';
import SettingsActions from '../actions/SettingsActions';
import UIStore from '../stores/UIStore';
import WindowTitle from './general/WindowTitle';

const ICONS = {
  satisfied: <Checkmark />,
};

const METHODS_TO_BIND = [
  'handleVerifyError',
  'handleVerifySuccess',
  'handleLoginError',
  'handleLoginSuccess',
  'handleRegisterSuccess',
  'handleUIDependenciesChange',
  'handleUIDependenciesLoaded',
];

class AuthEnforcer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor() {
    super();

    this.state = {
      authStatusDetermined: false,
      dependencies: {},
      isAuthenticated: false,
      isClientConnected: ClientStatusStore.getIsConnected(),
      dependenciesLoaded: false,
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    AuthStore.listen(EventTypes.AUTH_REGISTER_SUCCESS, this.handleRegisterSuccess);
    AuthStore.listen(EventTypes.AUTH_LOGIN_ERROR, this.handleLoginError);
    AuthStore.listen(EventTypes.AUTH_LOGIN_SUCCESS, this.handleLoginSuccess);
    AuthStore.listen(EventTypes.AUTH_VERIFY_ERROR, this.handleVerifyError);
    AuthStore.listen(EventTypes.AUTH_VERIFY_SUCCESS, this.handleVerifySuccess);
    ClientStatusStore.listen(EventTypes.CLIENT_CONNECTION_STATUS_CHANGE, this.handleClientStatusChange);
    UIStore.listen(EventTypes.UI_DEPENDENCIES_LOADED, this.handleUIDependenciesLoaded);
    UIStore.listen(EventTypes.UI_DEPENDENCIES_CHANGE, this.handleUIDependenciesChange);
    AuthStore.verify();
  }

  componentWillUnmount() {
    AuthStore.unlisten(EventTypes.AUTH_REGISTER_SUCCESS, this.handleRegisterSuccess);
    AuthStore.unlisten(EventTypes.AUTH_LOGIN_ERROR, this.handleLoginError);
    AuthStore.unlisten(EventTypes.AUTH_LOGIN_SUCCESS, this.handleLoginSuccess);
    AuthStore.unlisten(EventTypes.AUTH_VERIFY_ERROR, this.handleVerifyError);
    AuthStore.unlisten(EventTypes.AUTH_VERIFY_SUCCESS, this.handleVerifySuccess);
    ClientStatusStore.unlisten(EventTypes.CLIENT_CONNECTION_STATUS_CHANGE, this.handleClientStatusChange);
    UIStore.unlisten(EventTypes.UI_DEPENDENCIES_LOADED, this.handleUIDependenciesLoaded);
    UIStore.unlisten(EventTypes.UI_DEPENDENCIES_CHANGE, this.handleUIDependenciesChange);
  }

  handleClientStatusChange = () => {
    this.setState({
      isClientConnected: ClientStatusStore.getIsConnected(),
    });
  };

  handleVerifySuccess(data) {
    if (data.initialUser) {
      this.setState({authStatusDetermined: true, isAuthenticated: false});
      browserHistory.replace('register');
    } else {
      this.setState({authStatusDetermined: true, isAuthenticated: true});
      ClientActions.fetchSettings();
      SettingsActions.fetchSettings();
      browserHistory.replace('overview');
    }
  }

  handleVerifyError() {
    this.setState({authStatusDetermined: true, isAuthenticated: false});
    browserHistory.replace('login');
  }

  handleLoginError() {
    this.setState({authStatusDetermined: true, isAuthenticated: false});
    browserHistory.replace('login');
  }

  handleLoginSuccess() {
    ClientActions.fetchSettings();
    SettingsActions.fetchSettings();
    FloodActions.restartActivityStream();
    this.setState({authStatusDetermined: true, isAuthenticated: true});
    browserHistory.replace('overview');
  }

  handleRegisterSuccess() {
    FloodActions.restartActivityStream();
    this.setState({authStatusDetermined: true, isAuthenticated: true});
    browserHistory.replace('overview');
  }

  handleUIDependenciesChange() {
    this.setState({
      dependencies: UIStore.getDependencies(),
    });
  }

  handleUIDependenciesLoaded() {
    this.setState({dependenciesLoaded: true});
  }

  isLoading() {
    // If the auth status is undetermined, show the loading indicator.
    if (!this.state.authStatusDetermined) {
      return true;
    }

    // Allow the UI to load if the user is not authenticated.
    if (!this.state.isAuthenticated) {
      return false;
    }

    // Iterate over current dependencies looking for unsatisified dependencies.
    const isDependencyActive = Object.keys(this.state.dependencies).some(
      dependencyKey => !this.state.dependencies[dependencyKey].satisfied,
    );

    // If any dependency is unsatisfied, show the loading indicator.
    if (isDependencyActive) {
      return true;
    }

    // Dismiss the loading indicator if the UI store thinks all dependencies
    // are loaded.
    return !this.state.dependenciesLoaded;
  }

  renderOverlay() {
    if (this.isLoading()) {
      return (
        <div className="application__loading-overlay">
          <LoadingIndicator inverse />
          {this.renderDependencyList()}
        </div>
      );
    }

    if (this.state.isAuthenticated && !this.state.isClientConnected) {
      return (
        <div className="application__loading-overlay">
          <div className="application__entry-barrier">
            <ClientConnectionInterruption />
          </div>
        </div>
      );
    }

    return null;
  }

  renderDependencyList() {
    const {dependencies} = this.state;
    const listItems = Object.keys(dependencies).map(id => {
      const {message, satisfied} = dependencies[id];
      const statusIcon = ICONS.satisfied;
      const classes = classnames('dependency-list__dependency', {
        'dependency-list__dependency--satisfied': satisfied,
      });

      return (
        <li className={classes} key={id}>
          <span className="dependency-list__dependency__icon">{statusIcon}</span>
          <span className="dependency-list__dependency__message">{message}</span>
        </li>
      );
    });

    return <ul className="dependency-list">{listItems}</ul>;
  }

  render() {
    return (
      <div className="application">
        <WindowTitle />
        <CSSTransitionGroup
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
          transitionName="application__loading-overlay">
          {this.renderOverlay()}
        </CSSTransitionGroup>
        {this.props.children}
      </div>
    );
  }
}

export default AuthEnforcer;
