import React from 'react';

import {Button, Checkbox} from '../../ui';
import UIActions from '../../actions/UIActions';

import type {ModalAction} from '../../stores/UIStore';

interface ModalActionsProps {
  actions: Array<ModalAction>;
}

const ModalActions: React.FC<ModalActionsProps> = (props: ModalActionsProps) => {
  const {actions} = props;

  const buttons = actions.map((action, index) => {
    let dismissIfNeeded = () => {
      // do nothing by default.
    };

    if (action.triggerDismiss) {
      dismissIfNeeded = () => {
        UIActions.dismissModal();
      };
    }

    if (action.type === 'checkbox') {
      return (
        <Checkbox
          checked={action.checked}
          id={action.id}
          key={index} // eslint-disable-line react/no-array-index-key
          onChange={(event) => {
            if (action.clickHandler != null) {
              action.clickHandler(event);
            }
            dismissIfNeeded();
          }}>
          {action.content}
        </Checkbox>
      );
    }

    return (
      <Button
        isLoading={action.isLoading}
        onClick={(event) => {
          if (action.clickHandler != null) {
            action.clickHandler(event);
          }
          dismissIfNeeded();
        }}
        priority={action.type}
        key={index} // eslint-disable-line react/no-array-index-key
        type={action.submit ? 'submit' : 'button'}>
        {action.content}
      </Button>
    );
  });

  const buttonsGroup = <div className="modal__button-group">{buttons}</div>;

  return <div className="modal__actions">{buttonsGroup}</div>;
};

export default ModalActions;
