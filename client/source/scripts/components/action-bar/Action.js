import React from 'react';

import Stop from '../icons/Stop';

export default class Action extends React.Component {
  render() {
    let classString = 'action action--' + this.props.slug;

    return (
      <div className={classString} onClick={this.props.clickHandler}>
        {this.props.icon}
        <span className="action__label">{this.props.label}</span>
      </div>
    );
  }
}
