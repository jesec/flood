import classnames from 'classnames';
import {cloneElement, ReactElement, ReactNode, ReactNodeArray, Children, useState, useEffect, useRef, FC} from 'react';
import {useEvent, useKey} from 'react-use';

import {Chevron} from '@client/ui/icons';

import Button from './Button';
import ContextMenu from './ContextMenu';
import {dispatchChangeEvent} from './util/forms';
import FormElementAddon from './FormElementAddon';
import FormRowItem from './FormRowItem';
import Portal from './Portal';

import type {FormRowItemProps} from './FormRowItem';
import type {ButtonProps} from './Button';
import type {SelectItemProps} from './SelectItem';

interface SelectProps {
  id: string | number;
  children: ReactNode;
  defaultID?: string | number;
  additionalClassNames?: string;
  width?: FormRowItemProps['width'];
  priority?: ButtonProps['priority'];
  onOpen?: () => void;
  onClose?: () => void;
  onSelect?: (id: this['id']) => void;
  label?: ReactNode;
  menuAlign?: 'left' | 'right';
  disabled?: boolean;
  persistentPlaceholder?: boolean;
  matchTriggerWidth?: boolean;
  shrink?: boolean;
  grow?: boolean;
  labelOffset?: boolean;
}

const Select: FC<SelectProps> = ({
  additionalClassNames,
  children,
  defaultID,
  disabled,
  label,
  labelOffset,
  persistentPlaceholder,
  priority,
  shrink,
  grow,
  matchTriggerWidth,
  width,
  id,
  menuAlign,
  onOpen,
  onClose,
  onSelect,
}: SelectProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedID, setSelectedID] = useState<string | number>(
    defaultID ??
      (
        (children as ReactNodeArray)?.find(
          (child) => (child as ReactElement<SelectItemProps>)?.props?.id != null,
        ) as ReactElement<SelectItemProps>
      )?.props.id ??
      '',
  );

  const classes = classnames('select form__element', additionalClassNames, {
    'form__element--disabled': disabled,
    'form__element--label-offset': labelOffset,
    'select--is-open': isOpen,
  });

  const selectedItem = Children.toArray(children).find((child, index) => {
    const item = child as ReactElement<SelectItemProps>;
    return (
      (persistentPlaceholder && item.props.isPlaceholder) ||
      (!selectedID && index === 0) ||
      item.props.id === selectedID
    );
  });

  useKey('Escape', (event) => {
    event.preventDefault();
    setIsOpen(false);
  });

  useEvent(
    'scroll',
    (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    },
    window,
    {capture: true},
  );

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [isOpen, onClose, onOpen]);

  useEffect(() => {
    onSelect?.(selectedID);

    if (inputRef.current != null) {
      dispatchChangeEvent(inputRef.current);
    }
  }, [onSelect, selectedID]);

  return (
    <FormRowItem shrink={shrink} grow={grow} width={width}>
      {label && (
        <label className="form__element__label" htmlFor={`${id}`}>
          {label}
        </label>
      )}
      <div className={classes}>
        <input
          className="input input--hidden"
          name={`${id}`}
          onChange={() => undefined}
          tabIndex={-1}
          ref={inputRef}
          type="text"
          value={selectedID}
        />
        <Button
          additionalClassNames="select__button"
          buttonRef={triggerRef}
          addonPlacement="after"
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
            }
          }}
          priority={priority}
          wrap={false}
        >
          <FormElementAddon className="select__indicator">
            <Chevron />
          </FormElementAddon>
          {selectedItem && cloneElement(selectedItem as ReactElement, {isTrigger: true})}
        </Button>
        <Portal>
          <ContextMenu
            onOverlayClick={() => {
              setIsOpen(!isOpen);
            }}
            isIn={isOpen}
            matchTriggerWidth={matchTriggerWidth}
            menuAlign={menuAlign}
            ref={menuRef}
            triggerRef={triggerRef}
          >
            {Children.toArray(children).reduce((accumulator: Array<ReactElement>, child) => {
              const item = child as ReactElement<SelectItemProps>;

              if (item.props.isPlaceholder) {
                return accumulator;
              }

              accumulator.push(
                cloneElement(child as ReactElement, {
                  onClick: (selection: string | number) => {
                    setIsOpen(false);
                    setSelectedID(selection);
                  },
                  isSelected: item.props.id === selectedID,
                }),
              );

              return accumulator;
            }, [])}
          </ContextMenu>
        </Portal>
      </div>
    </FormRowItem>
  );
};

Select.defaultProps = {
  defaultID: undefined,
  additionalClassNames: undefined,
  width: undefined,
  onOpen: undefined,
  onClose: undefined,
  onSelect: undefined,
  label: undefined,
  menuAlign: undefined,
  disabled: undefined,
  matchTriggerWidth: undefined,
  shrink: undefined,
  grow: undefined,
  labelOffset: undefined,
  persistentPlaceholder: false,
  priority: 'quaternary',
};

export default Select;
