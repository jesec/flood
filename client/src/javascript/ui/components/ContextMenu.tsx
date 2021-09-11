import CSSTransition from 'react-transition-group/CSSTransition';
import classnames from 'classnames';
import {CSSProperties, forwardRef, MouseEvent, ReactNode, RefObject} from 'react';

import Overlay from './Overlay';

import type {OverlayProps} from './Overlay';

const minPreferableBottomSpace = 150;
const minPreferableHorizontalSpace = 200;

interface ContextMenuProps {
  children: ReactNode;
  isIn: boolean;
  menuAlign?: 'left' | 'right';
  triggerCoordinates?: {
    x: number;
    y: number;
  };
  triggerRef?: RefObject<Element>;
  matchTriggerWidth?: boolean;
  padding?: boolean;
  scrolling?: boolean;
  overlayProps?: OverlayProps;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onOverlayClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onOverlayRightClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  (
    {
      children,
      isIn,
      matchTriggerWidth,
      menuAlign,
      padding,
      scrolling,
      triggerRef,
      triggerCoordinates,
      onClick,
      onOverlayClick,
      onOverlayRightClick,
      overlayProps,
    }: ContextMenuProps,
    ref,
  ) => {
    const dropdownStyle: CSSProperties = {};
    let shouldRenderAbove = false;

    if (triggerRef?.current) {
      const buttonBoundingRect = triggerRef.current.getBoundingClientRect();
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

      if (matchTriggerWidth) {
        dropdownStyle.width = buttonBoundingRect.width;
        dropdownStyle.left = buttonBoundingRect.left;
        dropdownStyle.right = window.innerWidth - buttonBoundingRect.left - buttonBoundingRect.width;
      } else if (menuAlign === 'right') {
        dropdownStyle.right = window.innerWidth - buttonBoundingRect.left - buttonBoundingRect.width;
      } else {
        dropdownStyle.left = buttonBoundingRect.left;
      }
    } else if (triggerCoordinates) {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const spaceAbove = triggerCoordinates.y;
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

      if (menuAlign === 'right' || windowWidth - triggerCoordinates.x < minPreferableHorizontalSpace) {
        dropdownStyle.right = windowWidth - triggerCoordinates.x;
      } else {
        dropdownStyle.left = triggerCoordinates.x;
      }
    }

    const classes = classnames('context-menu__items', {
      'context-menu__items--is-up': shouldRenderAbove,
      'context-menu__items--is-down': !shouldRenderAbove,
      'context-menu__items--match-trigger-width': matchTriggerWidth,
      'context-menu__items--no-padding': !padding,
      'context-menu__items--no-scrolling': !scrolling,
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
        in={isIn}
        mountOnEnter
        unmountOnExit
        timeout={250}
      >
        <div className="context-menu" onClick={onClick} role="none">
          <Overlay
            additionalClassNames="context-menu__overlay"
            onClick={onOverlayClick}
            onContextMenu={onOverlayRightClick}
            isTransparent
            {...overlayProps}
          />
          <div className={classes} ref={ref} style={dropdownStyle}>
            {children}
          </div>
        </div>
      </CSSTransition>
    );
  },
);

ContextMenu.defaultProps = {
  matchTriggerWidth: true,
  menuAlign: 'left',
  overlayProps: {},
  padding: true,
  scrolling: true,
  triggerRef: undefined,
  triggerCoordinates: {
    x: 0,
    y: 0,
  },
  onClick: undefined,
  onOverlayClick: undefined,
  onOverlayRightClick: undefined,
};

export default ContextMenu;
