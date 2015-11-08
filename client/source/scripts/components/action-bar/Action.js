import React from 'react';

import Icon from '../icons/Icon';

export default class Action extends React.Component {

  constructor() {
    super();
  }

  render() {
    let classString = 'action action--' + this.props.slug;

    return (
      <div className={classString} onClick={this.props.clickHandler}>
        <Icon icon={this.props.icon} />
        <span className="action__label">{this.props.label}</span>
      </div>
    );
  }

}
