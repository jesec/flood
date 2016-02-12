import classnames from 'classnames';
import React from 'react';

const MAX_LEVEL = 2;

const METHODS_TO_BIND = ['handleClick'];

export default class PriorityMeter extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleClick() {
    this.props.onChange(this.props.fileIndex);
  }

  render() {
    return (
      <div className="priority-meter__wrapper" onClick={this.handleClick}>
        <div className={`priority-meter priority-meter--level-${this.props.level}`}/>
      </div>
    );
  }
}
