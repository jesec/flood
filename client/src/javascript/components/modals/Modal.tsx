import classnames from 'classnames';
import {FC, ReactNode, useState} from 'react';

import ModalActions from './ModalActions';
import ModalTabs from './ModalTabs';

import type {ModalAction} from '../../stores/UIStore';
import type {Tab} from './ModalTabs';

interface ModalProps {
  heading: ReactNode;
  content?: ReactNode;
  className?: string | null;
  alignment?: 'left' | 'center';
  size?: 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  tabsInBody?: boolean;
  inverse?: boolean;
  actions?: Array<ModalAction>;
  tabs?: Record<string, Tab>;
  initialTabId?: string;
}

const Modal: FC<ModalProps> = (props: ModalProps) => {
  const {alignment, size, orientation, tabsInBody, inverse, initialTabId, className, content, heading, tabs, actions} =
    props;

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

  const [activeTabId, setActiveTabId] = useState<string>(initialTabId ?? Object.keys(tabs || {})[0]);
  if (tabs) {
    const activeTab = tabs[activeTabId];
    const contentClasses = classnames('modal__content', activeTab.modalContentClasses);

    const ModalContentComponent = activeTab.content;
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
  initialTabId: undefined,
};

export default Modal;
