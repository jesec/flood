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
  tabs?: Record<string, Tab>;
  onTabChange: (tab: Tab) => void;
}

const ModalTabs: React.FC<ModalTabsProps> = (props: ModalTabsProps) => {
  const {activeTabId, tabs = {}, onTabChange} = props;

  const tabNodes: React.ReactNodeArray = Object.keys(tabs).map((tabId) => {
    const currentTab = tabs[tabId];

    currentTab.id = tabId;

    const classes = classnames('modal__tab', {
      'is-active': tabId === activeTabId,
    });

    return (
      <li
        className={classes}
        key={tabId}
        onClick={() => {
          if (onTabChange) {
            onTabChange(currentTab);
          }
        }}>
        {currentTab.label}
      </li>
    );
  });

  return <ul className="modal__tabs">{tabNodes}</ul>;
};

ModalTabs.defaultProps = {
  tabs: {},
};

export default ModalTabs;
