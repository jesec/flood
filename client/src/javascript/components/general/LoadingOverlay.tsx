import classnames from 'classnames';
import {FC} from 'react';
import {useLingui} from '@lingui/react';

import {Button} from '@client/ui';
import {CheckmarkThick} from '@client/ui/icons';

import type {Dependencies} from '@client/stores/UIStore';

import LoadingIndicator from './LoadingIndicator';

const ICONS = {
  satisfied: <CheckmarkThick />,
};

const LoadingDependencyList: FC<{dependencies: Dependencies}> = ({dependencies}: {dependencies: Dependencies}) => {
  const {i18n} = useLingui();

  return (
    <ul className="dependency-list">
      {Object.keys(dependencies).map((id: string) => {
        const {message, satisfied} = dependencies[id];
        const statusIcon = ICONS.satisfied;
        const classes = classnames('dependency-list__dependency', {
          'dependency-list__dependency--satisfied': satisfied,
        });

        return (
          <li className={classes} key={id}>
            {satisfied != null ? <span className="dependency-list__dependency__icon">{statusIcon}</span> : null}
            <span className="dependency-list__dependency__message">
              {typeof message === 'string' ? message : i18n._(message)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

const LoadingLogoutButton: FC<{onLogout: () => void}> = ({onLogout}) => {
  const {i18n} = useLingui();

  return (
    <div className="application__loading-recovery">
      <Button priority="tertiary" onClick={onLogout}>
        {i18n._('sidebar.button.log.out')}
      </Button>
    </div>
  );
};

interface LoadingOverlayProps {
  className?: string;
  dependencies?: Dependencies;
  onLogout?: () => void;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({className, dependencies, onLogout}: LoadingOverlayProps) => {
  return (
    <div className={classnames('application__loading-overlay', className)}>
      <LoadingIndicator inverse />
      {dependencies != null ? <LoadingDependencyList dependencies={dependencies} /> : null}
      {onLogout != null ? <LoadingLogoutButton onLogout={onLogout} /> : null}
    </div>
  );
};

export default LoadingOverlay;
