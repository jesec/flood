import classnames from 'classnames';
import {Component, cloneElement, createRef, ReactElement, ReactNode, ReactNodeArray, Children} from 'react';

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

interface SelectStates {
  isOpen: boolean;
  selectedID: string | number;
}

export default class Select extends Component<SelectProps, SelectStates> {
  menuRef = createRef<HTMLDivElement>();

  inputRef = createRef<HTMLInputElement>();

  triggerRef = createRef<HTMLButtonElement>();

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

    const childArray = children as ReactNodeArray;
    if (childArray != null) {
      const item = childArray.find(
        (child) => (child as ReactElement<SelectItemProps>).props.id != null,
      ) as ReactElement<SelectItemProps>;

      if (item?.props?.id != null) {
        return item.props.id;
      }
    }

    return '';
  }

  getItemList(children: ReactNodeArray) {
    return children.reduce((accumulator: Array<ReactElement>, child) => {
      const item = child as ReactElement<SelectItemProps>;

      if (item.props.isPlaceholder) {
        return accumulator;
      }

      const {selectedID} = this.state;

      accumulator.push(
        cloneElement(child as ReactElement, {
          onClick: this.handleItemClick,
          isSelected: item.props.id === selectedID,
        }),
      );

      return accumulator;
    }, []);
  }

  getLabel(): ReactNode {
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

  getSelectedItem(children: ReactNodeArray): ReactElement | undefined {
    const {persistentPlaceholder} = this.props;
    const {selectedID} = this.state;

    const selectedItem = children.find((child, index) => {
      const item = child as ReactElement<SelectItemProps>;
      return (
        (persistentPlaceholder && item.props.isPlaceholder) ||
        (!selectedID && index === 0) ||
        item.props.id === selectedID
      );
    });

    if (selectedItem) {
      return cloneElement(selectedItem as ReactElement, {isTrigger: true});
    }

    return undefined;
  }

  getTrigger(selectItems: ReactNodeArray) {
    const {priority} = this.props;
    const selectedItem = this.getSelectedItem(selectItems);

    return (
      <Button
        additionalClassNames="select__button"
        buttonRef={this.triggerRef}
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

      if (this.inputRef.current) {
        dispatchChangeEvent(this.inputRef.current);
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
    if (this.menuRef.current && !this.menuRef.current.contains(event.target as Node)) {
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

    const selectItems = Children.toArray(children);
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
            onChange={() => undefined}
            tabIndex={-1}
            ref={this.inputRef}
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
              ref={this.menuRef}
              triggerRef={this.triggerRef}>
              {this.getItemList(selectItems)}
            </ContextMenu>
          </Portal>
        </div>
      </FormRowItem>
    );
  }
}
