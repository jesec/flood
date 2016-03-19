import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import LoadingIndicator from '../ui/LoadingIndicator';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = ['handleUIDependenciesLoaded'];

class ApplicationLoadingIndicator extends React.Component {
  constructor() {
    super();

    this.state = {
      dependenciesLoaded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    UIStore.listen(EventTypes.UI_DEPENDENCIES_LOADED,
      this.handleUIDependenciesLoaded);
  }

  handleUIDependenciesLoaded() {
    this.setState({dependenciesLoaded: true});
  }

  render() {
    let content;

    if (!this.state.dependenciesLoaded) {
      content = (
        <div className="application__loading-indicator">
          <LoadingIndicator inverse={true} />
        </div>
      );
    }

    console.log(this.state.dependenciesLoaded);

    return (
      <CSSTransitionGroup
        className="application__loading-indicator__wrapper"
        transitionEnterTimeout={1000}
        transitionLeaveTimeout={1000}
        transitionName="application__loading-indicator__wrapper">
        {content}
      </CSSTransitionGroup>
    );
  }
}

export default ApplicationLoadingIndicator;
