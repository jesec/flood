import classnames from 'classnames';
import React from 'react';

const METHODS_TO_BIND = ['handleClick'];
const PRIORITY_MAP = {
  2: {
    0: 'Don\'t Download',
    1: 'Normal',
    2: 'High'
  },
  3: {
    0: 'Don\'t Download',
    1: 'Low',
    2: 'Normal',
    3: 'High'
  }
};

export default class PriorityMeter extends React.Component {
  constructor() {
    super();

    this.state = {
      optimisticData: {
        level: null
      }
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getPriorityLabel() {
    return PRIORITY_MAP[this.props.maxLevel][this.getPriorityLevel()];
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
      label = (
        <span className="priority-meter__label">
          {this.getPriorityLabel()}
        </span>
      );
    }

    return (
      <div className="priority-meter__wrapper" onClick={this.handleClick}>
        <div className={`priority-meter ` +
          `priority-meter--max-${this.props.maxLevel} ` +
          `priority-meter--level-${this.getPriorityLevel()}`}/>
        {label}
      </div>
    );
  }
}
