import {Button, Checkbox} from 'flood-ui-kit';
import classnames from 'classnames';
import React from 'react';

import UIActions from '../../actions/UIActions';

export default class ModalActions extends React.Component {
  getModalButtons(actions) {
    const buttons = actions.map((action, index) => {
      const classes = classnames('button', {
        [action.supplementalClassName]: action.supplementalClassName,
      });

      if (action.type === 'checkbox') {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Checkbox checked={action.checked} id={action.id} key={index} onChange={this.getClickHandler(action)}>
            {action.content}
          </Checkbox>
        );
      }

      return (
        <Button
          className={classes}
          isLoading={action.isLoading}
          onClick={this.getClickHandler(action)}
          priority={action.type}
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          type={action.submit ? 'submit' : 'button'}>
          {action.content}
        </Button>
      );
    });

    return <div className="modal__button-group">{buttons}</div>;
  }

  getClickHandler(action) {
    return event => {
      if (action.clickHandler) {
        action.clickHandler(event);
      }

      if (action.triggerDismiss) {
        UIActions.dismissModal();
      }
    };
  }

  render() {
    return <div className="modal__actions">{this.getModalButtons(this.props.actions)}</div>;
  }
}

ModalActions.defaultProps = {
  alignment: 'left',
};
