import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
import React from 'react';

import AuthStore from '../stores/AuthStore';
import Checkmark from './icons/Checkmark';
import ClientConnectionInterruption from './general/ClientConnectionInterruption';
import ClientStatusStore from '../stores/ClientStatusStore';
import connectStores from '../util/connectStores';
import EventTypes from '../constants/EventTypes';
import LoadingIndicator from './general/LoadingIndicator';
import UIStore from '../stores/UIStore';
import WindowTitle from './general/WindowTitle';

const ICONS = {
  satisfied: <Checkmark />,
};

class AuthEnforcer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  isLoading() {
    const {dependencies, dependenciesLoaded, isAuthenticated, isAuthenticating} = this.props;
    // If the auth status is undetermined, show the loading indicator.
    if (!isAuthenticating) return true;
    // Allow the UI to load if the user is not authenticated.
    if (!isAuthenticated) return false;
    // Iterate over current dependencies looking for unsatisified dependencies.
    const isDependencyActive = Object.keys(dependencies).some(dependencyKey => !dependencies[dependencyKey].satisfied);
    // If any dependency is unsatisfied, show the loading indicator.
    if (isDependencyActive) return true;
    // Dismiss the loading indicator if the UI store thinks all dependencies
    // are loaded.
    return !dependenciesLoaded;
  }

  renderOverlay() {
    const {isAuthenticated, isClientConnected} = this.props;

    if (this.isLoading()) {
      return (
        <div className="application__loading-overlay">
          <LoadingIndicator inverse />
          {this.renderDependencyList()}
        </div>
      );
    }

    if (isAuthenticated && !isClientConnected) {
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
    const {dependencies} = this.props;
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

const ConnectedAuthEnforcer = connectStores(AuthEnforcer, () => {
  return [
    {
      store: AuthStore,
      event: [
        EventTypes.AUTH_LOGIN_SUCCESS,
        EventTypes.AUTH_REGISTER_SUCCESS,
        EventTypes.AUTH_VERIFY_SUCCESS,
        EventTypes.AUTH_VERIFY_ERROR,
      ],
      getValue: ({store}) => {
        return {
          isAuthenticating: store.getIsAuthenticating(),
          isAuthenticated: store.getIsAuthenticated(),
        };
      },
    },
    {
      store: UIStore,
      event: EventTypes.UI_DEPENDENCIES_CHANGE,
      getValue: ({store}) => {
        return {
          dependencies: store.getDependencies(),
        };
      },
    },
    {
      store: UIStore,
      event: EventTypes.UI_DEPENDENCIES_LOADED,
      getValue: ({store}) => {
        return {
          dependenciesLoaded: store.haveUIDependenciesResolved,
        };
      },
    },
    {
      store: ClientStatusStore,
      event: EventTypes.CLIENT_CONNECTION_STATUS_CHANGE,
      getValue: ({store}) => {
        return {
          isClientConnected: store.getIsConnected(),
        };
      },
    },
  ];
});

export default ConnectedAuthEnforcer;
