import classnames from 'classnames';
import React from 'react';

export default class LoadingIndicator extends React.Component {
  render() {
    let classes = classnames('loading-indicator', {
      'is-inverse': this.props.inverse,
    });

    return (
      <div className={classes} key="loading-indicator">
        <div className="loading-indicator__bar loading-indicator__bar--1" />
        <div className="loading-indicator__bar loading-indicator__bar--2" />
        <div className="loading-indicator__bar loading-indicator__bar--3" />
      </div>
    );
  }
}
