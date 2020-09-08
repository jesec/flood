import CSSTransition from 'react-transition-group/CSSTransition';
import classnames from 'classnames';
import React from 'react';

import Overlay from './Overlay';
import transitionTimeouts from '../constants/transitionTimeouts';

import type {OverlayProps} from './Overlay';

const minPreferableBottomSpace = 150;
const minPreferableHorizontalSpace = 200;

interface ContextMenuProps {
  menuAlign?: 'left' | 'right';
  triggerCoordinates?: {
    x: number;
    y: number;
  };
  triggerRef?: Element | null;
  setRef?: React.Ref<HTMLDivElement>;
  overlayProps?: OverlayProps;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onOverlayClick?: () => void;
  matchTriggerWidth?: boolean;
  padding?: boolean;
  scrolling?: boolean;
  in?: boolean;
}

export default class ContextMenu extends React.PureComponent<ContextMenuProps> {
  dropdownStyle?: React.CSSProperties;

  static defaultProps = {
    matchTriggerWidth: true,
    menuAlign: 'left',
    overlayProps: {},
    padding: true,
    scrolling: true,
  };

  handleOverlayClick = () => {
    if (this.props.onOverlayClick) {
      this.props.onOverlayClick();
    }
  };

  render() {
    const dropdownStyle: React.CSSProperties = {};
    let shouldRenderAbove = false;

    if (this.props.triggerRef) {
      const buttonBoundingRect = this.props.triggerRef.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceAbove = buttonBoundingRect.top;
      const spaceBelow = windowHeight - buttonBoundingRect.bottom;

      shouldRenderAbove = spaceBelow < minPreferableBottomSpace && spaceAbove > spaceBelow;

      if (shouldRenderAbove) {
        dropdownStyle.top = 'auto';
        dropdownStyle.bottom = spaceBelow + buttonBoundingRect.height + 5;
        dropdownStyle.maxHeight = buttonBoundingRect.top - 10;
      } else {
        dropdownStyle.top = buttonBoundingRect.bottom + 5;
        dropdownStyle.maxHeight = spaceBelow - 10;
      }

      if (this.props.matchTriggerWidth) {
        dropdownStyle.width = buttonBoundingRect.width;
        dropdownStyle.left = buttonBoundingRect.left;
        dropdownStyle.right = window.innerWidth - buttonBoundingRect.left - buttonBoundingRect.width;
      } else if (this.props.menuAlign === 'right') {
        dropdownStyle.right = window.innerWidth - buttonBoundingRect.left - buttonBoundingRect.width;
      } else {
        dropdownStyle.left = buttonBoundingRect.left;
      }

      this.dropdownStyle = dropdownStyle;
    } else if (this.props.triggerCoordinates) {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const spaceAbove = this.props.triggerCoordinates.y;
      const spaceBelow = windowHeight - spaceAbove;

      shouldRenderAbove = spaceBelow < minPreferableBottomSpace && spaceAbove > spaceBelow;

      if (shouldRenderAbove) {
        dropdownStyle.top = 'auto';
        dropdownStyle.bottom = spaceBelow;
        dropdownStyle.maxHeight = spaceAbove - 10;
      } else {
        dropdownStyle.top = spaceAbove;
        dropdownStyle.maxHeight = spaceBelow - 10;
      }

      if (
        this.props.menuAlign === 'right' ||
        windowWidth - this.props.triggerCoordinates.x < minPreferableHorizontalSpace
      ) {
        dropdownStyle.right = windowWidth - this.props.triggerCoordinates.x;
      } else {
        dropdownStyle.left = this.props.triggerCoordinates.x;
      }

      this.dropdownStyle = dropdownStyle;
    }

    const classes = classnames('context-menu__items', {
      'context-menu__items--is-up': shouldRenderAbove,
      'context-menu__items--is-down': !shouldRenderAbove,
      'context-menu__items--match-trigger-width': this.props.matchTriggerWidth,
      'context-menu__items--no-padding': !this.props.padding,
      'context-menu__items--no-scrolling': !this.props.scrolling,
    });

    return (
      <CSSTransition
        classNames={{
          enter: 'context-menu--enter',
          enterActive: 'context-menu--enter--active',
          exit: 'context-menu--exit',
          exitActive: 'context-menu--exit--active',
          appear: 'context-menu--appear',
          appearActive: 'context-menu--appear--active',
        }}
        in={this.props.in}
        mountOnEnter
        unmountOnExit
        timeout={transitionTimeouts.xFast}>
        <div className="context-menu" onClick={this.props.onClick}>
          <Overlay
            additionalClassNames="context-menu__overlay"
            onClick={this.handleOverlayClick}
            isTransparent
            {...this.props.overlayProps}
          />
          <div className={classes} ref={this.props.setRef} style={dropdownStyle}>
            {this.props.children}
          </div>
        </div>
      </CSSTransition>
    );
  }
}
