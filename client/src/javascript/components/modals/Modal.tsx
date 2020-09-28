import classnames from 'classnames';
import React from 'react';

import ModalActions from './ModalActions';
import ModalTabs from './ModalTabs';

import type {Tab} from './ModalTabs';

interface ModalProps {
  heading?: React.ReactNode;
  content?: React.ReactNode;
  className?: string | null;
  alignment?: 'left' | 'center';
  size?: 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  tabsInBody?: boolean;
  inverse?: boolean;
  actions?: ModalActions['props']['actions'];
  tabs?: Record<string, Tab>;
  onSetRef?: (id: string, ref: HTMLDivElement | null) => void;
}

interface ModalStates {
  activeTabId: string | null;
}

const METHODS_TO_BIND = ['handleTabChange'] as const;

export default class Modal extends React.Component<ModalProps, ModalStates> {
  domRefs: Record<string, HTMLDivElement | null> = {};

  static defaultProps = {
    alignment: 'left',
    className: null,
    inverse: true,
    size: 'medium',
    orientation: 'horizontal',
    tabsInBody: false,
  };

  constructor(props: ModalProps) {
    super(props);

    this.state = {
      activeTabId: null,
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleTabChange(tab: Tab) {
    this.setState({activeTabId: tab.id || null});
  }

  setRef(id: string, ref: HTMLDivElement | null) {
    this.domRefs[id] = ref;

    if (this.props.onSetRef) {
      this.props.onSetRef(id, ref);
    }
  }

  render() {
    const contentWrapperClasses = classnames(
      'modal__content__wrapper',
      `modal--align-${this.props.alignment}`,
      `modal--size-${this.props.size}`,
      {
        'modal--horizontal': this.props.orientation === 'horizontal',
        'modal--vertical': this.props.orientation === 'vertical',
        'modal--tabs-in-header': !this.props.tabsInBody,
        'modal--tabs-in-body': this.props.tabsInBody,
        inverse: this.props.inverse,
      },
      this.props.className,
    );
    let modalBody = this.props.content;
    const modalHeader = this.props.heading;
    const headerClasses = classnames('modal__header', {
      'has-tabs': this.props.tabs,
    });

    let bodyTabs;
    let footer;
    let headerTabs;

    if (this.props.tabs) {
      let {activeTabId} = this.state;
      if (activeTabId == null) {
        [activeTabId] = Object.keys(this.props.tabs);
      }

      const activeTab = this.props.tabs[activeTabId];
      const contentClasses = classnames('modal__content', activeTab.modalContentClasses);

      const ModalContentComponent = activeTab.content as React.FunctionComponent;
      const modalContentData = activeTab.props;

      const tabs = (
        <ModalTabs
          activeTabId={activeTabId}
          key="modal-tabs"
          onTabChange={this.handleTabChange}
          tabs={this.props.tabs}
        />
      );

      if (this.props.tabsInBody) {
        bodyTabs = tabs;
      } else {
        headerTabs = tabs;
      }

      modalBody = [
        bodyTabs,
        <div className={contentClasses} key="modal-content">
          <ModalContentComponent {...modalContentData} />
        </div>,
      ];
    }

    if (this.props.actions) {
      footer = (
        <div className="modal__footer">
          <ModalActions actions={this.props.actions} />
        </div>
      );
    }

    return (
      <div className={contentWrapperClasses}>
        <div className={headerClasses}>
          {modalHeader}
          {headerTabs}
        </div>
        <div className="modal__body" ref={(ref) => this.setRef('modal-body', ref)}>
          {modalBody}
          {footer}
        </div>
      </div>
    );
  }
}
