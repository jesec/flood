import {FC} from 'react';

import {Button, Checkbox} from '@client/ui';
import UIStore from '@client/stores/UIStore';

import type {ModalAction} from '@client/stores/UIStore';

interface ModalActionsProps {
  actions: Array<ModalAction>;
}

const ModalActions: FC<ModalActionsProps> = (props: ModalActionsProps) => {
  const {actions} = props;

  const buttons = actions.map((action, index) => {
    let dismissIfNeeded = () => {
      // do nothing by default.
    };

    if (action.triggerDismiss) {
      dismissIfNeeded = () => {
        UIStore.setActiveModal(null);
      };
    }

    if (action.type === 'checkbox') {
      return (
        <Checkbox
          defaultChecked={action.checked}
          id={action.id}
          key={index} // eslint-disable-line react/no-array-index-key
          onClick={(event) => {
            if (action.clickHandler != null) {
              action.clickHandler(event);
            }
            dismissIfNeeded();
          }}
        >
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
        type={action.submit ? 'submit' : 'button'}
      >
        {action.content}
      </Button>
    );
  });

  const buttonsGroup = <div className="modal__button-group">{buttons}</div>;

  return <div className="modal__actions">{buttonsGroup}</div>;
};

export default ModalActions;
