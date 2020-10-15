import classnames from 'classnames';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import React from 'react';

import AuthStore from '../stores/AuthStore';
import ConfigStore from '../stores/ConfigStore';
import Checkmark from './icons/Checkmark';
import ClientConnectionInterruption from './general/ClientConnectionInterruption';
import ClientStatusStore from '../stores/ClientStatusStore';
import connectStores from '../util/connectStores';
import LoadingIndicator from './general/LoadingIndicator';
import UIStore from '../stores/UIStore';
import WindowTitle from './general/WindowTitle';

import type {Dependencies} from '../stores/UIStore';

const ICONS = {
  satisfied: <Checkmark />,
};

interface AuthEnforcerProps {
  children: React.ReactNode;
  dependencies?: Dependencies;
  dependenciesLoaded?: boolean;
  isAuthenticated?: boolean;
  isAuthenticating?: boolean;
  isClientConnected?: boolean;
}

class AuthEnforcer extends React.Component<AuthEnforcerProps> {
  isLoading() {
    const {dependencies, dependenciesLoaded, isAuthenticated, isAuthenticating} = this.props;
    // If the auth status is undetermined, show the loading indicator.
    if (!isAuthenticating) return true;
    // Allow the UI to load if the user is not authenticated.
    if (!isAuthenticated) return false;
    // Iterate over current dependencies looking for unsatisified dependencies.
    let isDependencyActive;
    if (dependencies != null) {
      isDependencyActive = Object.keys(dependencies).some((dependencyKey) => !dependencies[dependencyKey].satisfied);
    }
    // If any dependency is unsatisfied, show the loading indicator.
    if (isDependencyActive) return true;
    // Dismiss the loading indicator if the UI store thinks all dependencies
    // are loaded.
    return !dependenciesLoaded;
  }

  renderOverlay() {
    const {isAuthenticated, isClientConnected} = this.props;
    let content;

    if (this.isLoading()) {
      content = (
        <div className="application__loading-overlay">
          <LoadingIndicator inverse />
          {this.renderDependencyList()}
        </div>
      );
    }

    // TODO: disableUsersAndAuth is server's config not user's
    if (isAuthenticated && !isClientConnected && !ConfigStore.getDisableAuth()) {
      content = (
        <div className="application__loading-overlay">
          <div className="application__entry-barrier">
            <ClientConnectionInterruption />
          </div>
        </div>
      );
    }

    return content != null ? (
      <CSSTransition timeout={{enter: 1000, exit: 1000}} classNames="application__loading-overlay">
        {content}
      </CSSTransition>
    ) : null;
  }

  renderDependencyList() {
    const {dependencies} = this.props;
    let listItems;
    if (dependencies != null) {
      listItems = Object.keys(dependencies).map((id: string) => {
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
    }

    return <ul className="dependency-list">{listItems}</ul>;
  }

  render() {
    const {children} = this.props;

    return (
      <div className="application">
        <WindowTitle />
        <TransitionGroup>{this.renderOverlay()}</TransitionGroup>
        {children}
      </div>
    );
  }
}

const ConnectedAuthEnforcer = connectStores(AuthEnforcer, () => {
  return [
    {
      store: AuthStore,
      event: ['AUTH_LOGIN_SUCCESS', 'AUTH_REGISTER_SUCCESS', 'AUTH_VERIFY_SUCCESS', 'AUTH_VERIFY_ERROR'],
      getValue: ({store}) => {
        const storeAuth = store as typeof AuthStore;
        return {
          isAuthenticating: storeAuth.getIsAuthenticating(),
          isAuthenticated: storeAuth.getIsAuthenticated(),
        };
      },
    },
    {
      store: UIStore,
      event: 'UI_DEPENDENCIES_CHANGE',
      getValue: ({store}) => {
        const storeUI = store as typeof UIStore;
        return {
          dependencies: storeUI.getDependencies(),
        };
      },
    },
    {
      store: UIStore,
      event: 'UI_DEPENDENCIES_LOADED',
      getValue: ({store}) => {
        const storeUI = store as typeof UIStore;
        return {
          dependenciesLoaded: storeUI.haveUIDependenciesResolved,
        };
      },
    },
    {
      store: ClientStatusStore,
      event: 'CLIENT_CONNECTION_STATUS_CHANGE',
      getValue: ({store}) => {
        const storeClientStatus = store as typeof ClientStatusStore;
        return {
          isClientConnected: storeClientStatus.getIsConnected(),
        };
      },
    },
  ];
});

export default ConnectedAuthEnforcer;
