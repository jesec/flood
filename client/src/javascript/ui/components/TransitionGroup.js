import _ from 'lodash';
import CSSTransition from 'react-transition-group/CSSTransition';
import React, {Component} from 'react';

import transitionTimeouts from '../constants/transitionTimeouts';

class TransitionGroup extends Component {
  static defaultProps = {
    mountOnEnter: true,
    unmountOnExit: true,
    timeout: transitionTimeouts.xFast,
  };

  render() {
    return (
      <CSSTransition
        classNames={{
          enter: `${this.props.transitionName}--enter`,
          enterActive: `${this.props.transitionName}--enter--active`,
          exit: `${this.props.transitionName}--exit`,
          exitActive: `${this.props.transitionName}--exit--active`,
          appear: `${this.props.transitionName}--appear`,
          appearActive: `${this.props.transitionName}--appear--active`,
        }}
        {..._.omit(this.props, 'transitionName')}
      />
    );
  }
}

export default TransitionGroup;
