import classnames from 'classnames';
import React from 'react';

const MAX_LEVEL = 2;

const METHODS_TO_BIND = ['handleClick'];

export default class PriorityMeter extends React.Component {
  constructor() {
    super();

    this.state = {
      level: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getLevel() {
    if (this.state.level == null) {
      return this.props.level;
    } else {
      return this.state.level;
    }
  }

  handleClick() {
    this.props.onChange(this.props.fileIndex);
  }

  render() {
    let level = this.props.level;

    return (
      <div className="priority-meter__wrapper" onClick={this.handleClick}>
        <div className={`priority-meter priority-meter--level-${level}`}/>
      </div>
    );
  }
}
