import CSSTransition, {CSSTransitionProps} from 'react-transition-group/CSSTransition';
import {FC, ReactNode} from 'react';

interface FadeInProps {
  children: ReactNode;
  isIn: CSSTransitionProps['in'];
}

const FadeIn: FC<FadeInProps> = ({children, isIn}: FadeInProps) => (
  <CSSTransition classNames="fade" mountOnEnter timeout={375} in={isIn}>
    {children}
  </CSSTransition>
);

export default FadeIn;
