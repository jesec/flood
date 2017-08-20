import {browserHistory} from 'react-router';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import AuthStore from '../../stores/AuthStore';
import Checkmark from '../icons/Checkmark';
import EventTypes from '../../constants/EventTypes';
import FloodActions from '../../actions/FloodActions';
import LoadingIndicator from '../general/LoadingIndicator';
import UIStore from '../../stores/UIStore';
import WindowTitle from '../general/WindowTitle';

const ICONS = {
  satisfied: <Checkmark />
};

const METHODS_TO_BIND = [
  'handleVerifyError',
  'handleVerifySuccess',
  'handleLoginError',
  'handleLoginSuccess',
  'handleRegisterSuccess',
  'handleUIDependenciesChange',
  'handleUIDependenciesLoaded'
];

class AuthEnforcer extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  constructor() {
    super();

    this.state = {
      authStatusDetermined: false,
      dependencies: {
        authentication: {
          message: (
            <FormattedMessage id="dependency.loading.authentication.status"
              defaultMessage="Authentication Status" />
          ),
          satisfied: false
        }
      },
      isAuthenticated: false,
      dependenciesLoaded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    AuthStore.listen(
      EventTypes.AUTH_REGISTER_SUCCESS,
      this.handleRegisterSuccess
    );
    AuthStore.listen(
      EventTypes.AUTH_LOGIN_ERROR,
      this.handleLoginError
    );
    AuthStore.listen(
      EventTypes.AUTH_LOGIN_SUCCESS,
      this.handleLoginSuccess
    );
    AuthStore.listen(
      EventTypes.AUTH_VERIFY_ERROR,
      this.handleVerifyError
    );
    AuthStore.listen(
      EventTypes.AUTH_VERIFY_SUCCESS,
      this.handleVerifySuccess
    );
    UIStore.listen(
      EventTypes.UI_DEPENDENCIES_LOADED,
      this.handleUIDependenciesLoaded
    );
    UIStore.listen(
      EventTypes.UI_DEPENDENCIES_CHANGE,
      this.handleUIDependenciesChange
    );
    AuthStore.verify();
  }

  componentWillUnmount() {
    AuthStore.unlisten(
      EventTypes.AUTH_REGISTER_SUCCESS,
      this.handleRegisterSuccess
    );
    AuthStore.unlisten(
      EventTypes.AUTH_LOGIN_ERROR,
      this.handleLoginError
    );
    AuthStore.unlisten(
      EventTypes.AUTH_LOGIN_SUCCESS,
      this.handleLoginSuccess
    );
    AuthStore.unlisten(
      EventTypes.AUTH_VERIFY_ERROR,
      this.handleVerifyError
    );
    AuthStore.unlisten(
      EventTypes.AUTH_VERIFY_SUCCESS,
      this.handleVerifySuccess
    );
    UIStore.unlisten(
      EventTypes.UI_DEPENDENCIES_LOADED,
      this.handleUIDependenciesLoaded
    );
    UIStore.unlisten(
      EventTypes.UI_DEPENDENCIES_CHANGE,
      this.handleUIDependenciesChange
    );
  }

  handleVerifySuccess(data) {
    if (data.initialUser) {
      this.setState({authStatusDetermined: true, isAuthenticated: false});
      browserHistory.replace('register');
    } else {
      this.setState({authStatusDetermined: true, isAuthenticated: true});
      browserHistory.replace('overview');
    }
  }

  handleVerifyError(error) {
    this.setState({authStatusDetermined: true, isAuthenticated: false});
    browserHistory.replace('login');
  }

  handleLoginError() {
    this.setState({authStatusDetermined: true, isAuthenticated: false});
    browserHistory.replace('login');
  }

  handleLoginSuccess() {
    FloodActions.restartActivityStream();
    this.setState({authStatusDetermined: true, isAuthenticated: true});
    browserHistory.replace('overview');
  }

  handleRegisterSuccess() {
    FloodActions.restartActivityStream();
    this.setState({authStatusDetermined: true, isAuthenticated: true});
    browserHistory.replace('overview');
  }

  getDependencyList() {
    let {dependencies} = this.state;

    return Object.keys(dependencies).map((id, index) => {
      let {message, satisfied} = dependencies[id];
      let statusIcon = ICONS.satisfied;

      let classes = classnames('dependency-list__dependency', {
        'dependency-list__dependency--satisfied': satisfied
      });

      return (
        <li className={classes} key={id}>
          <span className="dependency-list__dependency__icon">
            {statusIcon}
          </span>
          <span className="dependency-list__dependency__message">
            {message}
          </span>
        </li>
      );
    });
  }

  handleUIDependenciesChange() {
    this.setState({
      dependencies: {
        authentication: {
          message: (
            <FormattedMessage id="dependency.loading.authentication.status"
              defaultMessage="Authentication Status" />
          ),
          satisfied: this.state.authStatusDetermined
        },
        ...UIStore.getDependencies()
      }
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
    const isDependencyActive = Object.keys(this.state.dependencies)
      .some((dependencyKey) => {
        return !this.state.dependencies[dependencyKey].satisfied;
      });

    // If any dependency is unsatisfied, show the loading indicator.
    if (isDependencyActive) {
      return true;
    }

    // Dismiss the loading indicator if the UI store thinks all dependencies
    // are loaded.
    return !this.state.dependenciesLoaded;
  }

  render() {
    let loadingIndicator = null;

    if (this.isLoading()) {
      loadingIndicator = (
        <div className="application__dependency-list">
          <LoadingIndicator inverse={true} />
          <ul className="dependency-list">
            {this.getDependencyList()}
          </ul>
        </div>
      );
    }

    return (
      <div className="application">
        <WindowTitle />
        <CSSTransitionGroup
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
          transitionName="application__dependency-list">
          {loadingIndicator}
        </CSSTransitionGroup>
        {this.props.children}
      </div>
    );
  }
}

export default AuthEnforcer;
