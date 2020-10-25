import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {observer} from 'mobx-react';
import React from 'react';

import AuthStore from '../stores/AuthStore';
import ConfigStore from '../stores/ConfigStore';
import ClientConnectionInterruption from './general/ClientConnectionInterruption';
import ClientStatusStore from '../stores/ClientStatusStore';
import UIStore from '../stores/UIStore';
import WindowTitle from './general/WindowTitle';
import LoadingOverlay from './general/LoadingOverlay';

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = (props: AppWrapperProps) => {
  const {children} = props;

  let overlay: React.ReactNode = null;
  if (!AuthStore.isAuthenticating || (AuthStore.isAuthenticated && !UIStore.haveUIDependenciesResolved)) {
    overlay = <LoadingOverlay dependencies={UIStore.dependencies} />;
  }

  // TODO: disableUsersAndAuth is server's config not user's
  if (AuthStore.isAuthenticated && !ClientStatusStore.isConnected && !ConfigStore.getDisableAuth()) {
    overlay = (
      <div className="application__loading-overlay">
        <div className="application__entry-barrier">
          <ClientConnectionInterruption />
        </div>
      </div>
    );
  }

  return (
    <div className="application">
      <WindowTitle />
      <TransitionGroup>
        {overlay != null ? (
          <CSSTransition timeout={{enter: 1000, exit: 1000}} classNames="application__loading-overlay">
            {overlay}
          </CSSTransition>
        ) : null}
      </TransitionGroup>
      {children}
    </div>
  );
};

export default observer(AppWrapper);
