import classnames from 'classnames';
import React from 'react';

import ModalActions from './ModalActions';
import ModalTabs from './ModalTabs';

import type {ModalAction} from './ModalActions';
import type {Tab} from './ModalTabs';

interface ModalProps {
  heading: React.ReactNode;
  content?: React.ReactNode;
  className?: string | null;
  alignment?: 'left' | 'center';
  size?: 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  tabsInBody?: boolean;
  inverse?: boolean;
  actions?: Array<ModalAction>;
  tabs?: Record<string, Tab>;
}

const Modal: React.FC<ModalProps> = (props: ModalProps) => {
  const {alignment, size, orientation, tabsInBody, inverse, className, content, heading, tabs, actions} = props;

  const contentWrapperClasses = classnames(
    'modal__content__wrapper',
    `modal--align-${alignment}`,
    `modal--size-${size}`,
    {
      'modal--horizontal': orientation === 'horizontal',
      'modal--vertical': orientation === 'vertical',
      'modal--tabs-in-header': !tabsInBody,
      'modal--tabs-in-body': tabsInBody,
      inverse,
    },
    className,
  );
  let modalBody = content;
  const modalHeader = heading;
  const headerClasses = classnames('modal__header', {
    'has-tabs': tabs,
  });

  let bodyTabs;
  let footer;
  let headerTabs;

  if (tabs) {
    const [activeTabId, setActiveTabId] = React.useState(Object.keys(tabs)[0]);

    const activeTab = tabs[activeTabId];
    const contentClasses = classnames('modal__content', activeTab.modalContentClasses);

    const ModalContentComponent = activeTab.content as React.FunctionComponent;
    const modalContentData = activeTab.props;

    const modalTabs = (
      <ModalTabs
        activeTabId={activeTabId}
        key="modal-tabs"
        onTabChange={(tab) => {
          if (tab.id != null) {
            setActiveTabId(tab.id);
          }
        }}
        tabs={tabs}
      />
    );

    if (tabsInBody) {
      bodyTabs = modalTabs;
    } else {
      headerTabs = modalTabs;
    }

    modalBody = [
      bodyTabs,
      <div className={contentClasses} key="modal-content">
        <ModalContentComponent {...modalContentData} />
      </div>,
    ];
  }

  if (actions) {
    footer = (
      <div className="modal__footer">
        <ModalActions actions={actions} />
      </div>
    );
  }

  return (
    <div className={contentWrapperClasses}>
      <div className={headerClasses}>
        {modalHeader}
        {headerTabs}
      </div>
      <div className="modal__body">
        {modalBody}
        {footer}
      </div>
    </div>
  );
};

Modal.defaultProps = {
  alignment: 'left',
  className: null,
  inverse: true,
  size: 'medium',
  orientation: 'horizontal',
  tabsInBody: false,
  content: undefined,
  actions: undefined,
  tabs: undefined,
};

export default Modal;
