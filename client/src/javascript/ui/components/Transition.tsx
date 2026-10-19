import {FC, ReactNode, useEffect} from 'react';
import {TransitionOptions, TransitionStatus, useTransitionState} from 'react-transition-state';

interface TransitionProps extends Pick<TransitionOptions, 'mountOnEnter' | 'timeout' | 'unmountOnExit'> {
  children: (transitionClassName?: string) => ReactNode;
  classNamePrefix: string;
  in: boolean;
}

const STATUS_CLASS_NAMES: Record<TransitionStatus, string> = {
  preEnter: 'pre-enter',
  entering: 'entering',
  entered: 'entered',
  preExit: 'pre-exit',
  exiting: 'exiting',
  exited: 'exited',
  unmounted: 'unmounted',
};

export const getTransitionClassName = (classNamePrefix: string, status: TransitionStatus): string =>
  `${classNamePrefix}--${STATUS_CLASS_NAMES[status]}`;

const Transition: FC<TransitionProps> = ({
  children,
  classNamePrefix,
  in: isIn,
  mountOnEnter,
  timeout,
  unmountOnExit,
}) => {
  const [state, toggle] = useTransitionState({
    initialEntered: isIn,
    mountOnEnter,
    preEnter: true,
    preExit: true,
    timeout,
    unmountOnExit,
  });

  useEffect(() => toggle(isIn), [isIn, toggle]);

  return state.isMounted ? children(getTransitionClassName(classNamePrefix, state.status)) : null;
};

export default Transition;
