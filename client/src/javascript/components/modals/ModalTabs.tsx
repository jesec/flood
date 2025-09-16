import classnames from 'classnames';
import {FC, ReactNode} from 'react';

import {css} from '@client/styled-system/css';

export interface Tab {
  id?: string;
  label: ReactNode;

  content: FC<any>;
  props?: Record<string, unknown>;
  modalContentClasses?: string;
}

interface ModalTabsProps {
  activeTabId: string | null;
  tabs?: Record<string, Tab>;
  onTabChange: (tab: Tab) => void;
}

const ModalTabs: FC<ModalTabsProps> = ({activeTabId, tabs = {}, onTabChange}: ModalTabsProps) => {
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
              className={css({
                _focus: {
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                },
                _focusVisible: {
                  outline: 'dashed',
                },
              })}
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

export default ModalTabs;
