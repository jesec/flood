import classnames from 'classnames';
import React from 'react';

import Checkbox from '../General/FormElements/Checkbox';
import UIActions from '../../actions/UIActions';

export default class ModalActions extends React.Component {
  getModalButtons(actions) {
    let buttons = actions.map((action, index) => {
      let classes = classnames('button', {
        [action.supplementalClassName]: action.supplementalClassName,
        'button--deemphasize': action.type === 'secondary',
        'button--primary': action.type === 'primary'
      });

      if (action.type === 'checkbox') {
        return (
          <Checkbox checked={action.checked} key={index}
            onChange={this.getClickHandler(action)}>
            {action.content}
          </Checkbox>
        );
      }

      return (
        <button className={classes} onClick={this.getClickHandler(action)} key={index}>
          {action.content}
        </button>
      );
    });

    return (
      <div className="modal__button-group">
        {buttons}
      </div>
    );
  }

  getClickHandler(action) {
    return (data) => {
      if (action.clickHandler) {
        action.clickHandler(data);
      }

      if (action.triggerDismiss) {
        UIActions.dismissModal();
      }
    };
  }

  render() {
    return (
      <div className="modal__actions">
        {this.getModalButtons(this.props.actions)}
      </div>
    );
  }
}

ModalActions.defaultProps = {
  alignment: 'left'
};
