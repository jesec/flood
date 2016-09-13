import _ from 'lodash';
import classnames from 'classnames';
import createFragment from 'react-addons-create-fragment';
import React from 'react';

import ModalActions from './ModalActions';
import ModalTabs from './ModalTabs';

const METHODS_TO_BIND = ['handleTabChange'];

export default class Modal extends React.Component {
  constructor() {
    super();

    this.state = {
      activeTabId: null
    };

    METHODS_TO_BIND.forEach((method) => {
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

  render() {
    let footer = null;
    let contentClasses = classnames('modal__content__wrapper',
      `modal--align-${this.props.alignment}`, `modal--size-${this.props.size}`, {
        'modal--horizontal': this.props.orientation === 'horizontal',
        'modal--vertical': this.props.orientation === 'vertical',
        'modal--tabs-in-header': !this.props.tabsInBody,
        'modal--tabs-in-body': this.props.tabsInBody
      }, this.props.classNames);
    let modalBody = [createFragment({'modal-body': this.props.content})];
    let modalHeader = [createFragment({'modal-header': this.props.heading})];
    let headerClasses = classnames('modal__header', {
      'has-tabs': this.props.tabs
    });
    let tabs = null;

    if (this.props.tabs) {
      let activeTabId = this.getActiveTabId();
      let activeTab = this.props.tabs[activeTabId];
      let contentClasses = classnames('modal__content',
        activeTab.modalContentClasses);

      let ModalContentComponent = activeTab.content;
      let modalContentData = activeTab.props;

      let tabs = (
        <ModalTabs activeTabId={activeTabId} key="modal-tabs"
          onTabChange={this.handleTabChange} tabs={this.props.tabs} />
      );

      if (this.props.tabsInBody) {
        modalBody = [tabs];
      } else {
        modalHeader.push(tabs);
      }

      modalBody.push(
        <div className={contentClasses} key="modal-content">
          <ModalContentComponent {...modalContentData} />
        </div>
      );
    }

    if (this.props.actions) {
      footer = (
        <div className="modal__footer">
          <ModalActions actions={this.props.actions}
            dismiss={this.props.dismiss} />
        </div>
      );
    }

    return (
      <div className={contentClasses}>
        <div className={headerClasses}>
          {modalHeader}
        </div>
        <div className="modal__body">
          {modalBody}
          {footer}
        </div>
      </div>
    );
  }
}

Modal.defaultProps = {
  alignment: 'left',
  classNames: null,
  size: 'medium',
  orientation: 'horizontal',
  tabsInBody: false
};
