import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

import CustomScrollbars from '../ui/CustomScrollbars';
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

  handleMenuWrapperClick(event) {
    event.stopPropagation();
  }

  render() {
    let content = this.props.content;
    let footer = null;
    let contentClasses = classnames('modal__content__wrapper',
      `modal--align-${this.props.alignment}`, {
        'modal--orientation--horizontal': this.props.orientation === 'horizontal',
        'modal--orientation--vertical': this.props.orientation === 'vertical'
      }, this.props.classNames);
    let headerClasses = classnames('modal__header', {
      'has-tabs': this.props.tabs
    });
    let tabs = null;

    if (this.props.tabs) {
      let activeTabId = this.getActiveTabId();

      content = this.props.tabs[activeTabId].content;
      tabs = (
        <ModalTabs activeTabId={activeTabId} onTabChange={this.handleTabChange}
          tabs={this.props.tabs} />
      );
    }

    if (this.props.actions) {
      footer = (
        <ModalActions actions={this.props.actions}
          dismiss={this.props.dismiss} />
      );
    }

    return (
      <div className={contentClasses} onClick={this.handleMenuWrapperClick}>
        <div className={headerClasses}>
          {this.props.heading}
          {tabs}
        </div>
        <div className="modal__content">
          <div className="modal__body">
            {content}
          </div>
          {footer}
        </div>
      </div>
    );
  }
}

Modal.defaultProps = {
  alignment: 'left',
  classNames: null,
  orientation: 'horizontal'
};
