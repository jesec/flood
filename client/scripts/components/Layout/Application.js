import {browserHistory} from 'react-router';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import {FormattedMessage} from 'react-intl';
import React from 'react';

import AuthStore from '../../stores/AuthStore';
import Checkmark from '../Icons/Checkmark';
import Close from '../Icons/Close';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicator from '../General/LoadingIndicator';
import UIStore from '../../stores/UIStore';

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

class Application extends React.Component {
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
    UIStore.listen(EventTypes.UI_DEPENDENCIES_CHANGE,
      this.handleUIDependenciesChange);
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

Application.propTypes = {
  children: React.PropTypes.node
};

export default Application;
