import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

export default class Modal extends React.Component {
  getModalButtons(actions) {
    let buttons = actions.map((action, index) => {
      let classes = classnames('button', {
        'button--deemphasize': action.type === 'secondary',
        'button--primary': action.type === 'primary'
      });

      return (
        <button className={classes} onClick={this.getClickHandler(action)} key={index}>
          {action.content}
        </button>
      );
    });

    return (
      <div className="modal__button-group form__row">
        {buttons}
      </div>
    );
  }

  getClickHandler(action) {
    return () => {
      if (action.triggerDismiss) {
        this.props.dismiss();
      }

      if (action.clickHandler) {
        action.clickHandler();
      }
    }
  }

  handleMenuWrapperClick(event) {
    event.stopPropagation();
  }

  render() {
    let contentClasses = classnames('modal__content',
      `modal__content--align-${this.props.alignment}`);

    return (
      <div className={contentClasses} onClick={this.handleMenuWrapperClick}>
        <div className="modal__header">{this.props.heading}</div>
        <div className="modal__content__container">
          {this.props.content}
        </div>
        <div className="modal__footer">
          {this.getModalButtons(this.props.actions)}
        </div>
      </div>
    );
  }
}

Modal.defaultProps = {
  alignment: 'left'
};
