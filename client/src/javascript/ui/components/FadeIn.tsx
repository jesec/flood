import CSSTransition, {CSSTransitionProps} from 'react-transition-group/CSSTransition';
import * as React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  isIn: CSSTransitionProps['in'];
}

const FadeIn: React.FC<FadeInProps> = ({children, isIn}: FadeInProps) => {
  return (
    <CSSTransition classNames="fade" mountOnEnter timeout={375} in={isIn}>
      {children}
    </CSSTransition>
  );
};

export default FadeIn;
