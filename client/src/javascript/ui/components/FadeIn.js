import CSSTransition from 'react-transition-group/CSSTransition';
import React from 'react';

class FadeIn extends React.PureComponent {
  render() {
    return (
      <CSSTransition classNames="fade" mountOnEnter timeout={375} {...this.props}>
        {this.props.children}
      </CSSTransition>
    );
  }
}

export default FadeIn;
