import classnames from 'classnames';
import {FC, ReactNode, ReactNodeArray} from 'react';

export interface Tab {
  id?: string;
  label: ReactNode;
  content: ReactNode | FC;
  props?: Record<string, unknown>;
  modalContentClasses?: string;
}

interface ModalTabsProps {
  activeTabId: string | null;
  tabs?: Record<string, Tab>;
  onTabChange: (tab: Tab) => void;
}

const ModalTabs: FC<ModalTabsProps> = (props: ModalTabsProps) => {
  const {activeTabId, tabs = {}, onTabChange} = props;

  const tabNodes: ReactNodeArray = Object.keys(tabs).map((tabId) => {
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
