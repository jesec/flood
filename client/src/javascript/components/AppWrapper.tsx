import classnames from 'classnames';
import {css} from '@emotion/css';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FC, ReactNode} from 'react';
import {observer} from 'mobx-react';
import {useEffectOnce} from 'react-use';
import {useNavigate} from 'react-router';
import {useSearchParams} from 'react-router-dom';

import AuthActions from '@client/actions/AuthActions';
import AuthStore from '@client/stores/AuthStore';
import ConfigStore from '@client/stores/ConfigStore';
import ClientStatusStore from '@client/stores/ClientStatusStore';
import UIStore from '@client/stores/UIStore';

import ClientConnectionInterruption from './general/ClientConnectionInterruption';
import WindowTitle from './general/WindowTitle';
import LoadingOverlay from './general/LoadingOverlay';
import LogoutButton from './sidebar/LogoutButton';

interface AppWrapperProps {
  children: ReactNode;
  className?: string;
}

const AppWrapper: FC<AppWrapperProps> = observer(({children, className}: AppWrapperProps) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  useEffectOnce(() => {
    AuthActions.verify().then(
      ({initialUser}: {initialUser?: boolean}): void => {
        if (initialUser) {
          navigate('/register', {replace: true});
        } else {
          navigate('/overview', {replace: true});
        }
      },
      (): void => {
        navigate('/login', {replace: true});
      },
    );
  });

  if (searchParams.has('action')) {
    if (searchParams.get('action') === 'add-urls') {
      if (searchParams.has('url')) {
        UIStore.setActiveModal({
          id: 'add-torrents',
          tab: 'by-url',
          urls: [{id: 0, value: searchParams.get('url') as string}],
        });
      }
    }
  }

  let overlay: ReactNode = null;
  if (!AuthStore.isAuthenticating || (AuthStore.isAuthenticated && !UIStore.haveUIDependenciesResolved)) {
    overlay = <LoadingOverlay dependencies={UIStore.dependencies} />;
  }

  if (AuthStore.isAuthenticated && !ClientStatusStore.isConnected && ConfigStore.authMethod !== 'none') {
    overlay = (
      <div className="application__loading-overlay">
        <div className="application__entry-barrier">
          <LogoutButton className={css({position: 'absolute', left: '5px', top: '5px'})} />
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
