import classnames from 'classnames';
import {FC, InputHTMLAttributes, MouseEvent, ReactNode, useRef} from 'react';

import {dispatchChangeEvent} from './util/forms';
import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

export interface ToggleInputProps {
  children?: ReactNode;
  id: InputHTMLAttributes<HTMLInputElement>['name'];
  groupID?: InputHTMLAttributes<HTMLInputElement>['name'];
  type: 'checkbox' | 'radio';
  value?: InputHTMLAttributes<HTMLInputElement>['value'];
  defaultChecked?: InputHTMLAttributes<HTMLInputElement>['defaultChecked'];
  checked?: InputHTMLAttributes<HTMLInputElement>['checked'];
  shrink?: FormRowItemProps['shrink'];
  grow?: FormRowItemProps['grow'];
  width?: FormRowItemProps['width'];
  icon: JSX.Element;
  matchTextboxHeight?: boolean;
  labelOffset?: boolean;
  onClick?: (event: MouseEvent<HTMLInputElement>) => void;
}

const ToggleInput: FC<ToggleInputProps> = ({
  children,
  id,
  groupID,
  type,
  value,
  defaultChecked,
  checked,
  shrink,
  grow,
  width,
  icon,
  matchTextboxHeight,
  labelOffset,
  onClick,
}: ToggleInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormRowItem shrink={shrink} grow={grow} width={width}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label
        className={classnames('form__element toggle-input', type, {
          'form__element--match-textbox-height': matchTextboxHeight,
          'form__element--label-offset': labelOffset,
        })}
      >
        <input
          defaultChecked={defaultChecked}
          checked={checked}
          className="toggle-input__element"
          name={type === 'radio' ? groupID : id}
          onClick={(event) => {
            if (inputRef.current != null) {
              dispatchChangeEvent(inputRef.current);
            }
            if (typeof onClick === 'function') {
              onClick(event);
            }
          }}
          onChange={(event) => {
            event.stopPropagation();
          }}
          ref={inputRef}
          type={type}
          value={value}
        />
        <div className="toggle-input__indicator">
          <div className="toggle-input__indicator__icon">{icon}</div>
        </div>
        <div className="toggle-input__label">{children}</div>
      </label>
    </FormRowItem>
  );
};

ToggleInput.defaultProps = {
  onClick: () => {
    // do nothing.
  },
  grow: false,
  shrink: false,
};

export default ToggleInput;
