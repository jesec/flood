import noop from 'lodash/noop';
import classnames from 'classnames';
import * as React from 'react';

import Button from './Button';
import ContextMenu from './ContextMenu';
import {dispatchChangeEvent} from './util/forms';
import FormElementAddon from './FormElementAddon';
import Chevron from '../icons/Chevron';
import FormRowItem from './FormRowItem';
import Portal from './Portal';
import SelectItem from './SelectItem';

import type {FormRowItemProps} from './FormRowItem';
import type {ButtonProps} from './Button';

interface SelectProps {
  id: string | number;
  defaultID?: string | number;
  additionalClassNames?: string;
  width?: FormRowItemProps['width'];
  priority?: ButtonProps['priority'];
  onOpen?: () => void;
  onClose?: () => void;
  onSelect?: (id: this['id']) => void;
  label?: React.ReactNode;
  menuAlign?: 'left' | 'right';
  disabled?: boolean;
  persistentPlaceholder?: boolean;
  matchTriggerWidth?: boolean;
  shrink?: boolean;
  grow?: boolean;
  labelOffset?: boolean;
}

interface SelectStates {
  isOpen: boolean;
  selectedID: string | number;
}

export default class Select extends React.Component<SelectProps, SelectStates> {
  menuRef: HTMLDivElement | null = null;

  inputRef: HTMLInputElement | null = null;

  triggerRef: HTMLButtonElement | null = null;

  static defaultProps = {
    persistentPlaceholder: false,
    priority: 'quaternary',
  };

  constructor(props: SelectProps) {
    super(props);

    this.state = {
      isOpen: false,
      selectedID: this.getInitialSelectedID(),
    };
  }

  componentDidUpdate(_prevProps: SelectProps, prevState: SelectStates) {
    const {onOpen, onClose} = this.props;
    const {isOpen} = this.state;

    if (isOpen && !prevState.isOpen) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });

      if (onOpen) {
        onOpen();
      }
    } else if (!isOpen && prevState.isOpen) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });

      if (onClose) {
        onClose();
      }
    }
  }

  getInitialSelectedID(): string | number {
    const {children, defaultID} = this.props;

    if (defaultID != null) {
      return defaultID;
    }

    const childArray = children as React.ReactNodeArray;
    if (childArray != null) {
      const item = childArray.find((child) => {
        return (child as SelectItem).props.id != null;
      }) as SelectItem;

      if (item?.props?.id != null) {
        return item.props.id;
      }
    }

    return '';
  }

  getItemList(children: React.ReactNodeArray) {
    return children.reduce((accumulator: Array<React.ReactElement>, child) => {
      const item = child as SelectItem;

      if (item.props.placeholder) {
        return accumulator;
      }

      const {selectedID} = this.state;

      accumulator.push(
        React.cloneElement(child as React.ReactElement, {
          onClick: this.handleItemClick,
          isSelected: item.props.id === selectedID,
        }),
      );

      return accumulator;
    }, []);
  }

  getLabel(): React.ReactNode {
    const {id, label} = this.props;

    if (label) {
      return (
        <label className="form__element__label" htmlFor={`${id}`}>
          {label}
        </label>
      );
    }

    return undefined;
  }

  getSelectedItem(children: React.ReactNodeArray): React.ReactElement | undefined {
    const {persistentPlaceholder} = this.props;
    const {selectedID} = this.state;

    const selectedItem = children.find((child, index) => {
      const item = child as SelectItem;
      return (
        (persistentPlaceholder && item.props.placeholder) ||
        (!selectedID && index === 0) ||
        item.props.id === selectedID
      );
    });

    if (selectedItem) {
      return React.cloneElement(selectedItem as React.ReactElement, {isTrigger: true});
    }

    return undefined;
  }

  getTrigger(selectItems: React.ReactNodeArray) {
    const {priority} = this.props;
    const selectedItem = this.getSelectedItem(selectItems);

    return (
      <Button
        additionalClassNames="select__button"
        buttonRef={(ref) => {
          this.triggerRef = ref;
        }}
        addonPlacement="after"
        onClick={this.handleTriggerClick}
        priority={priority}
        wrap={false}>
        <FormElementAddon className="select__indicator">
          <Chevron />
        </FormElementAddon>
        {selectedItem}
      </Button>
    );
  }

  handleTriggerClick = () => {
    if (!this.props.disabled) {
      this.toggleOpenState();
    }
  };

  handleItemClick = (id: string | number) => {
    this.setState({isOpen: false, selectedID: id}, () => {
      if (this.props.onSelect) {
        this.props.onSelect(id);
      }

      if (this.inputRef) {
        dispatchChangeEvent(this.inputRef);
      }
    });
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();

      this.setState({isOpen: false});
    }
  };

  handleOverlayClick = () => {
    this.toggleOpenState();
  };

  handleWindowScroll = (event: Event) => {
    if (this.menuRef && !this.menuRef.contains(event.target as Node)) {
      if (this.state.isOpen) {
        this.setState({isOpen: false});
      }
    }
  };

  toggleOpenState = () => {
    const wasOpen = this.state.isOpen;
    this.setState({
      isOpen: !wasOpen,
    });
  };

  render() {
    const {
      additionalClassNames,
      children,
      disabled,
      labelOffset,
      shrink,
      grow,
      matchTriggerWidth,
      width,
      id,
      menuAlign,
    } = this.props;
    const {isOpen, selectedID} = this.state;

    const selectItems = React.Children.toArray(children);
    const classes = classnames('select form__element', additionalClassNames, {
      'form__element--disabled': disabled,
      'form__element--label-offset': labelOffset,
      'select--is-open': isOpen,
    });

    return (
      <FormRowItem shrink={shrink} grow={grow} width={width}>
        {this.getLabel()}
        <div className={classes}>
          <input
            className="input input--hidden"
            name={`${id}`}
            onChange={noop}
            tabIndex={-1}
            ref={(ref) => {
              this.inputRef = ref;
            }}
            type="text"
            value={selectedID}
          />
          {this.getTrigger(selectItems)}
          <Portal>
            <ContextMenu
              onOverlayClick={this.handleOverlayClick}
              isIn={isOpen}
              matchTriggerWidth={matchTriggerWidth}
              menuAlign={menuAlign}
              setRef={(ref) => {
                this.menuRef = ref;
              }}
              triggerRef={this.triggerRef}>
              {this.getItemList(selectItems)}
            </ContextMenu>
          </Portal>
        </div>
      </FormRowItem>
    );
  }
}
