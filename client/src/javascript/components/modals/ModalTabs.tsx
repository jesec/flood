import classnames from 'classnames';
import {FC, ReactNode} from 'react';

export interface Tab {
  id?: string;
  label: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: FC<any>;
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

  return (
    <ul className="modal__tabs">
      {Object.keys(tabs).map((tabId) => {
        const currentTab = tabs[tabId];

        currentTab.id = tabId;

        const classes = classnames('modal__tab', {
          'is-active': tabId === activeTabId,
        });

        return (
          <li className={classes} key={tabId}>
            <button
              css={{
                ':focus': {
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                },
                ':focus-visible': {
                  outline: 'dashed',
                },
              }}
              type="button"
              onClick={() => {
                if (onTabChange) {
                  onTabChange(currentTab);
                }
              }}
            >
              {currentTab.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

ModalTabs.defaultProps = {
  tabs: {},
};

export default ModalTabs;
