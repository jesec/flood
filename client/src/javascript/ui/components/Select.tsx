import _ from 'lodash';
import classnames from 'classnames';
import React, {Component} from 'react';

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

export default class Select extends Component<SelectProps, SelectStates> {
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
    // if (!prevState.isOpen && this.state.isOpen) {
    //   // TODO: Set focus on the dropdown menu.
    // } else if (prevState.isOpen && !this.state.isOpen) {
    //   // this.triggerRef.focus();
    // }

    if (this.state.isOpen && !prevState.isOpen) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });

      if (this.props.onOpen) {
        this.props.onOpen();
      }
    } else if (!this.state.isOpen && prevState.isOpen) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });

      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }

  getInitialSelectedID(): string | number {
    if (this.props.defaultID != null) {
      return this.props.defaultID;
    }

    const childArray = this.props.children as React.ReactNodeArray;
    if (childArray != null) {
      const item = childArray.find((child) => {
        return (child as SelectItem).props.id != null;
      });

      if (item != null) {
        return (item as SelectItem).props.id;
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

      accumulator.push(
        React.cloneElement(child as React.ReactElement, {
          onClick: this.handleItemClick,
          isSelected: item.props.id === this.state.selectedID,
        }),
      );

      return accumulator;
    }, []);
  }

  getLabel() {
    if (this.props.label) {
      return (
        <label className="form__element__label" htmlFor={`${this.props.id}`}>
          {this.props.label}
        </label>
      );
    }
  }

  getSelectedItem(children: React.ReactNodeArray): React.ReactElement | undefined {
    const selectedItem = children.find((child, index) => {
      const item = child as SelectItem;
      return (
        (this.props.persistentPlaceholder && item.props.placeholder) ||
        (!this.state.selectedID && index === 0) ||
        item.props.id === this.state.selectedID
      );
    });

    if (selectedItem) {
      return React.cloneElement(selectedItem as React.ReactElement, {isTrigger: true});
    }
  }

  getTrigger(selectItems: React.ReactNodeArray) {
    const selectedItem = this.getSelectedItem(selectItems);

    return (
      <Button
        additionalClassNames="select__button"
        buttonRef={(ref) => {
          this.triggerRef = ref;
        }}
        addonPlacement="after"
        onClick={this.handleTriggerClick}
        priority={this.props.priority}
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
    const selectItems = React.Children.toArray(this.props.children);
    const classes = classnames('select form__element', this.props.additionalClassNames, {
      'form__element--disabled': this.props.disabled,
      'form__element--label-offset': this.props.labelOffset,
      'select--is-open': this.state.isOpen,
    });

    return (
      <FormRowItem shrink={this.props.shrink} grow={this.props.grow} width={this.props.width}>
        {this.getLabel()}
        <div className={classes}>
          <input
            className="input input--hidden"
            name={`${this.props.id}`}
            onChange={_.noop}
            tabIndex={-1}
            ref={(ref) => {
              this.inputRef = ref;
            }}
            type="text"
            value={this.state.selectedID}
          />
          {this.getTrigger(selectItems)}
          <Portal>
            <ContextMenu
              onOverlayClick={this.handleOverlayClick}
              in={this.state.isOpen}
              matchTriggerWidth={this.props.matchTriggerWidth}
              menuAlign={this.props.menuAlign}
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
