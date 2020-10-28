import classnames from 'classnames';
import * as React from 'react';

export interface Tab {
  id?: string;
  label: React.ReactNode;
  content: React.ReactNode | React.FunctionComponent;
  props?: Record<string, unknown>;
  modalContentClasses?: string;
}

interface ModalTabsProps {
  activeTabId: string | null;
  tabs: Record<string, Tab>;
  onTabChange: (tab: Tab) => void;
}

export default class ModalTabs extends React.Component<ModalTabsProps> {
  static defaultProps = {
    tabs: {},
  };

  handleTabClick(tab: Tab) {
    if (this.props.onTabChange) {
      this.props.onTabChange(tab);
    }
  }

  render() {
    const tabs = Object.keys(this.props.tabs).map((tabId) => {
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
