import classnames from 'classnames';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FC, ReactNode} from 'react';
import {observer} from 'mobx-react';

import AuthStore from '../stores/AuthStore';
import ConfigStore from '../stores/ConfigStore';
import ClientConnectionInterruption from './general/ClientConnectionInterruption';
import ClientStatusStore from '../stores/ClientStatusStore';
import UIStore from '../stores/UIStore';
import WindowTitle from './general/WindowTitle';
import LoadingOverlay from './general/LoadingOverlay';

interface AppWrapperProps {
  children: ReactNode;
  className?: string;
}

const AppWrapper: FC<AppWrapperProps> = observer((props: AppWrapperProps) => {
  const {children, className} = props;

  let overlay: ReactNode = null;
  if (!AuthStore.isAuthenticating || (AuthStore.isAuthenticated && !UIStore.haveUIDependenciesResolved)) {
    overlay = <LoadingOverlay dependencies={UIStore.dependencies} />;
  }

  if (AuthStore.isAuthenticated && !ClientStatusStore.isConnected && ConfigStore.authMethod !== 'none') {
    overlay = (
      <div className="application__loading-overlay">
        <div className="application__entry-barrier">
          <ClientConnectionInterruption />
        </div>
      </div>
    );
  }

  return (
    <div className={classnames('application', className)}>
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
});

AppWrapper.defaultProps = {
  className: undefined,
};

export default AppWrapper;
