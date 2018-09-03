import classnames from 'classnames';
import React from 'react';

export default class ModalTabs extends React.Component {
  handleTabClick(tab) {
    if (this.props.onTabChange) {
      this.props.onTabChange(tab);
    }
  }

  render() {
    let tabs = Object.keys(this.props.tabs).map((tabId, index) => {
      let currentTab = this.props.tabs[tabId];

      currentTab.id = tabId;

      let classes = classnames('modal__tab', {
        'is-active': tabId === this.props.activeTabId,
      });

      return (
        <li className={classes} key={index} onClick={this.handleTabClick.bind(this, currentTab)}>
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
