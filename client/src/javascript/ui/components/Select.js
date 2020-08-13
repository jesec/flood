import _ from 'lodash';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from './Button';
import ContextMenu from './ContextMenu';
import {dispatchChangeEvent} from './util/forms';
import FormElementAddon from './FormElementAddon';
import Chevron from '../icons/Chevron';
import FormRowItem from './FormRowItem';
import Portal from './Portal';

export default class Select extends Component {
  menuRef = null;

  inputRef = null;

  triggerRef = null;

  static propTypes = {
    defaultID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    value: PropTypes.string,
    children: PropTypes.node,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
    onSelect: PropTypes.func,
  };

  static defaultProps = {
    defaultID: '',
    persistentPlaceholder: false,
    priority: 'quaternary',
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      selectedID: this.getInitialSelectedID(props),
    };
  }

  componentDidUpdate(_prevProps, prevState) {
    if (!prevState.isOpen && this.state.isOpen) {
      // TODO: Set focus on the dropdown menu.
    } else if (prevState.isOpen && !this.state.isOpen) {
      // this.triggerRef.focus();
    }

    if (this.state.isOpen && !prevState.isOpen) {
      global.addEventListener('keydown', this.handleKeyDown);
      global.addEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });

      if (this.props.onOpen) {
        this.props.onOpen();
      }
    } else if (!this.state.isOpen && prevState.isOpen) {
      global.addEventListener('keydown', this.handleKeyDown);
      global.removeEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });

      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }

  getInitialSelectedID(props) {
    return props.defaultID || props.children.find((child) => child.id != null) || '';
  }

  getItemList(children) {
    return children.reduce((accumulator, child) => {
      if (child.props.placeholder) {
        return accumulator;
      }

      accumulator.push(
        React.cloneElement(child, {
          onClick: this.handleItemClick,
          isSelected: child.props.id === this.state.selectedID,
        }),
      );

      return accumulator;
    }, []);
  }

  getLabel() {
    if (this.props.label) {
      return (
        <label className="form__element__label" htmlFor={this.props.id}>
          {this.props.label}
        </label>
      );
    }
  }

  getSelectedItem(children) {
    const selectedItem = children.find((child, index) => {
      return (
        (this.props.persistentPlaceholder && child.props.placeholder) ||
        (!this.state.selectedID && index === 0) ||
        child.props.id === this.state.selectedID
      );
    });

    if (selectedItem) {
      return React.cloneElement(selectedItem, {isTrigger: true});
    }
  }

  getTrigger(selectItems) {
    const selectedItem = this.getSelectedItem(selectItems);

    if (this.props.triggerComponent) {
      return (
        <this.props.triggerComponent
          isOpen={this.state.isOpen}
          onClick={this.handleTriggerClick}
          setRef={this.setTriggerRef}>
          {selectedItem}
        </this.props.triggerComponent>
      );
    }

    return (
      <Button
        additionalClassNames="select__button"
        buttonRef={this.setTriggerRef}
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

  handleItemClick = (id) => {
    this.setState({isOpen: false, selectedID: id}, () => {
      if (this.props.onSelect) {
        this.props.onSelect(id);
      }

      if (this.inputRef) {
        dispatchChangeEvent(this.inputRef);
      }
    });
  };

  handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();

      this.setState({isOpen: false});
    }
  };

  handleOverlayClick = () => {
    this.toggleOpenState();
  };

  handleWindowScroll = (event) => {
    if (this.menuRef && !this.menuRef.contains(event.target)) {
      if (this.state.isOpen) {
        this.setState({isOpen: false});
      }
    }
  };

  setInputRef = (ref) => {
    this.inputRef = ref;
  };

  setMenuRef = (ref) => {
    this.menuRef = ref;
  };

  setTriggerRef = (ref) => {
    if (this.state.triggerRef !== ref) {
      this.setState({triggerRef: ref});
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
      <FormRowItem
        shrink={this.props.shrink}
        grow={this.props.grow}
        labelOffset={this.props.labelOffset}
        width={this.props.width}>
        {this.getLabel()}
        <div className={classes}>
          <input
            className="input input--hidden"
            name={this.props.id}
            onChange={_.noop}
            tabIndex={-1}
            ref={this.setInputRef}
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
              setRef={this.setMenuRef}
              triggerRef={this.state.triggerRef}>
              {this.getItemList(selectItems)}
            </ContextMenu>
          </Portal>
        </div>
      </FormRowItem>
    );
  }
}
