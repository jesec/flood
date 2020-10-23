import classnames from 'classnames';
import {useIntl} from 'react-intl';
import React from 'react';

import Checkmark from '../icons/Checkmark';
import LoadingIndicator from './LoadingIndicator';

import type {Dependencies} from '../../stores/UIStore';

const ICONS = {
  satisfied: <Checkmark />,
};

interface LoadingOverlayProps {
  dependencies?: Dependencies;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = (props: LoadingOverlayProps) => {
  const {dependencies} = props;

  return (
    <div className="application__loading-overlay">
      <LoadingIndicator inverse />
      <ul className="dependency-list">
        {dependencies != null
          ? Object.keys(dependencies).map((id: string) => {
              const {message, satisfied} = dependencies[id];
              const statusIcon = ICONS.satisfied;
              const classes = classnames('dependency-list__dependency', {
                'dependency-list__dependency--satisfied': satisfied,
              });

              return (
                <li className={classes} key={id}>
                  {satisfied != null ? <span className="dependency-list__dependency__icon">{statusIcon}</span> : null}
                  <span className="dependency-list__dependency__message">
                    {typeof message === 'string' ? message : useIntl().formatMessage(message)}
                  </span>
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
};

LoadingOverlay.defaultProps = {
  dependencies: undefined,
};

export default LoadingOverlay;
