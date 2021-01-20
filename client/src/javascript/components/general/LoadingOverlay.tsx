import classnames from 'classnames';
import {FC} from 'react';
import {useIntl} from 'react-intl';

import {CheckmarkThick} from '@client/ui/icons';

import type {Dependencies} from '@client/stores/UIStore';

import LoadingIndicator from './LoadingIndicator';

const ICONS = {
  satisfied: <CheckmarkThick />,
};

const LoadingDependencyList: FC<{dependencies: Dependencies}> = ({dependencies}: {dependencies: Dependencies}) => {
  const intl = useIntl();

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
              {typeof message === 'string' ? message : intl.formatMessage(message)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

const LoadingOverlay: FC<{dependencies?: Dependencies}> = (props: {dependencies?: Dependencies}) => {
  const {dependencies} = props;

  return (
    <div className="application__loading-overlay">
      <LoadingIndicator inverse />
      {dependencies != null ? <LoadingDependencyList dependencies={dependencies} /> : null}
    </div>
  );
};

LoadingOverlay.defaultProps = {
  dependencies: undefined,
};

export default LoadingOverlay;
