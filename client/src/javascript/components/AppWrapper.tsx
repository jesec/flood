import classnames from 'classnames';
import {css} from '@emotion/css';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FC, ReactNode} from 'react';
import {observer} from 'mobx-react';
import {useQueryParams, StringParam} from 'use-query-params';

import AuthStore from '../stores/AuthStore';
import ConfigStore from '../stores/ConfigStore';
import ClientConnectionInterruption from './general/ClientConnectionInterruption';
import ClientStatusStore from '../stores/ClientStatusStore';
import UIStore from '../stores/UIStore';
import WindowTitle from './general/WindowTitle';
import LoadingOverlay from './general/LoadingOverlay';
import LogoutButton from './sidebar/LogoutButton';

import AppWrapperStyles from '@styles/app-wrapper.module.scss';

interface AppWrapperProps {
  children: ReactNode;
  className?: string;
}

const AppWrapper: FC<AppWrapperProps> = observer((props: AppWrapperProps) => {
  const {children, className} = props;

  const [query] = useQueryParams({action: StringParam, url: StringParam});

  if (query.action) {
    if (query.action === 'add-urls') {
      if (query.url) {
        UIStore.setActiveModal({
          id: 'add-torrents',
          initialURLs: [{id: 0, value: query.url}],
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
      <div className={AppWrapperStyles['loading-overlay']}>
        <div className={AppWrapperStyles['entry-barrier']}>
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
          <CSSTransition timeout={{enter: 1000, exit: 1000}} classNames={AppWrapperStyles['loading-overlay']}>
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
