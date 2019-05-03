import classnames from 'classnames';
import React from 'react';

import ModalActions from './ModalActions';
import ModalTabs from './ModalTabs';

const METHODS_TO_BIND = ['handleTabChange'];

export default class Modal extends React.Component {
  constructor() {
    super();

    this.domRefs = {};
    this.state = {
      activeTabId: null,
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getActiveTabId() {
    if (this.state.activeTabId) {
      return this.state.activeTabId;
    }

    return Object.keys(this.props.tabs)[0];
  }

  handleTabChange(tab) {
    this.setState({activeTabId: tab.id});
  }

  setRef(id, ref) {
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
      const activeTabId = this.getActiveTabId();
      const activeTab = this.props.tabs[activeTabId];
      const contentClasses = classnames('modal__content', activeTab.modalContentClasses);

      const ModalContentComponent = activeTab.content;
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
          <ModalActions actions={this.props.actions} dismiss={this.props.dismiss} />
        </div>
      );
    }

    return (
      <div className={contentWrapperClasses}>
        <div className={headerClasses}>
          {modalHeader}
          {headerTabs}
        </div>
        <div className="modal__body" ref={ref => this.setRef('modal-body', ref)}>
          {modalBody}
          {footer}
        </div>
      </div>
    );
  }
}

Modal.defaultProps = {
  alignment: 'left',
  className: null,
  inverse: true,
  size: 'medium',
  orientation: 'horizontal',
  tabsInBody: false,
};
