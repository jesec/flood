import classnames from 'classnames';
import {cloneElement, FC, ReactElement} from 'react';

import Transition from './Transition';

interface FadeInProps {
  children: ReactElement<{className?: string}>;
  isIn?: boolean;
}

const FadeIn: FC<FadeInProps> = ({children, isIn}: FadeInProps) => (
  <Transition classNamePrefix="fade" mountOnEnter timeout={375} in={isIn === true}>
    {(transitionClassName) =>
      cloneElement(children, {className: classnames(children.props.className, transitionClassName)})
    }
  </Transition>
);

export default FadeIn;
