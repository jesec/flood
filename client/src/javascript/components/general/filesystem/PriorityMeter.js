import {injectIntl} from 'react-intl';
import React from 'react';

import PriorityLevels from '../../../constants/PriorityLevels';

const METHODS_TO_BIND = ['handleClick'];

class PriorityMeter extends React.Component {
  constructor() {
    super();

    this.state = {
      optimisticData: {
        level: null,
      },
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (this.props.bindExternalChangeHandler) {
      this.props.bindExternalChangeHandler(this.handleClick);
    }
  }

  componentWillUnmount() {
    if (this.props.bindExternalChangeHandler) {
      this.props.bindExternalChangeHandler(null);
    }
  }

  getPriorityLabel() {
    switch (PriorityLevels[this.props.priorityType][this.getPriorityLevel()]) {
      case 'DONT_DOWNLOAD':
        return this.props.intl.formatMessage({
          id: 'priority.dont.download',
        });
      case 'HIGH':
        return this.props.intl.formatMessage({
          id: 'priority.high',
        });
      case 'LOW':
        return this.props.intl.formatMessage({
          id: 'priority.low',
        });
      case 'NORMAL':
        return this.props.intl.formatMessage({
          id: 'priority.normal',
        });
      default:
        return '';
    }
  }

  getPriorityLevel() {
    if (this.state.optimisticData.level != null) {
      return this.state.optimisticData.level;
    }

    return this.props.level;
  }

  handleClick() {
    let level = this.getPriorityLevel();

    if (level++ >= this.props.maxLevel) {
      level = 0;
    }

    this.setState({optimisticData: {level}});
    this.props.onChange(this.props.id, level);
  }

  render() {
    let label = null;

    if (this.props.showLabel) {
      label = <span className="priority-meter__label">{this.getPriorityLabel()}</span>;
    }

    return (
      <div className="priority-meter__wrapper" onClick={this.handleClick}>
        <div
          className={
            'priority-meter ' +
            `priority-meter--max-${this.props.maxLevel} ` +
            `priority-meter--level-${this.getPriorityLevel()}`
          }
        />
        {label}
      </div>
    );
  }
}

export default injectIntl(PriorityMeter);
