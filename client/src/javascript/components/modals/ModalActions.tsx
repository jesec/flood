import React from 'react';

import {Button, Checkbox} from '../../ui';
import UIActions from '../../actions/UIActions';

interface BaseAction {
  content: React.ReactNode;
  triggerDismiss?: boolean;
}

interface CheckboxAction extends BaseAction {
  type: 'checkbox';
  id?: Checkbox['props']['id'];
  checked?: Checkbox['props']['checked'];
  clickHandler?: ((event: React.MouseEvent<HTMLInputElement> | KeyboardEvent) => void) | null;
}

interface ButtonAction extends BaseAction {
  type: 'primary' | 'tertiary';
  isLoading?: Button['props']['isLoading'];
  submit?: boolean;
  clickHandler?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null;
}

interface ModalActionsProps {
  actions: Array<CheckboxAction | ButtonAction>;
}

export default class ModalActions extends React.Component<ModalActionsProps> {
  render() {
    const buttons = this.props.actions.map((action, index) => {
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
  }
}
