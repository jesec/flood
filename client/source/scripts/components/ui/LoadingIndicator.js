import React from 'react';

export default class LoadingIndicator extends React.Component {
  render() {
    return (
      <div className="loading-indicator" key="loading-indicator">
        <div className="loading-indicator__bar loading-indicator__bar--1" />
        <div className="loading-indicator__bar loading-indicator__bar--2" />
        <div className="loading-indicator__bar loading-indicator__bar--3" />
      </div>
    );
  }
}
