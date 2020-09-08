import CSSTransition, {CSSTransitionProps} from 'react-transition-group/CSSTransition';
import React from 'react';

class FadeIn extends React.PureComponent<Partial<CSSTransitionProps>> {
  render() {
    return (
      <CSSTransition classNames="fade" mountOnEnter timeout={375} {...this.props}>
        {this.props.children}
      </CSSTransition>
    );
  }
}

export default FadeIn;
