import classnames from 'classnames';
import React from 'react';

export default class ModalTabs extends React.Component {
  handleTabClick(tab) {
    if (this.props.onTabChange) {
      this.props.onTabChange(tab);
    }
  }

  render() {
    const tabs = Object.keys(this.props.tabs).map(tabId => {
      const currentTab = this.props.tabs[tabId];

      currentTab.id = tabId;

      const classes = classnames('modal__tab', {
        'is-active': tabId === this.props.activeTabId,
      });

      return (
        <li className={classes} key={tabId} onClick={this.handleTabClick.bind(this, currentTab)}>
          {currentTab.label}
        </li>
      );
    });
    return <ul className="modal__tabs">{tabs}</ul>;
  }
}

ModalTabs.defaultProps = {
  tabs: [],
};
