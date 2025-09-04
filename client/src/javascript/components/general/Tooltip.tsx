import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  CSSProperties,
  ReactNode,
} from 'react';
import classnames from 'classnames';
import {createPortal} from 'react-dom';

import {css} from '@client/styled-system/css';

type Align = 'start' | 'center' | 'end';

type Position = 'top' | 'bottom' | 'right' | 'left';

type Coordinates = Record<Position, number>;

type Clearance = Coordinates & {
  boundingRect: Coordinates & {
    width: number;
    height: number;
  };
};

interface TooltipProps {
  children?: React.ReactNode;
  align?: Align;
  anchor?: Align;
  position?: Position;
  offset?: number;
  width?: number;
  maxWidth?: number;
  interactive?: boolean;
  suppress?: boolean;
  stayOpen?: boolean;
  wrapText?: boolean;
  className?: string;
  contentClassName?: string;
  wrapperClassName?: string;
  styles?: string | string[];
  content: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  onClick?: () => void;
  onMouseLeave?: () => void;
}

interface TooltipStates {
  anchor?: Align;
  coordinates?: Pick<Coordinates, 'left' | 'top'>;
  position?: Position;
  isOpen: boolean;
  wasTriggeredClose: boolean;
}

export interface TooltipHandle {
  dismissTooltip: (forceClose?: boolean) => void;
  isOpen: () => boolean;
}

const getNodeClearance = (domNode: HTMLElement) => {
  const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const boundingRect = domNode.getBoundingClientRect();

  return {
    bottom: viewportHeight - boundingRect.bottom,
    left: boundingRect.left,
    right: viewportWidth - boundingRect.right,
    top: boundingRect.top,
    boundingRect,
  };
};

const getPosition = (
  position: Position,
  clearance: Clearance,
  tooltipWidth: number,
  tooltipHeight: number,
): Position => {
  // Change the position if the tooltip will be rendered off the screen.
  switch (position) {
    case 'left':
      if (clearance.left < tooltipWidth) {
        return 'right';
      }
      break;
    case 'right':
      if (clearance.right < tooltipWidth) {
        return 'left';
      }
      break;
    case 'top':
      if (clearance.top < tooltipHeight) {
        return 'bottom';
      }
      break;
    case 'bottom':
      if (clearance.bottom < tooltipHeight && clearance.top > clearance.bottom) {
        return 'top';
      }
      break;
    default:
  }

  return position;
};

const transformAnchor = (
  anchor: Align,
  clearanceStart: number,
  clearanceEnd: number,
  tooltipDimension: number,
  triggerDimension: number,
): Align => {
  // Change the provided anchor based on the clearance available.
  if (anchor === 'start' && clearanceEnd < tooltipDimension) {
    return 'end';
  }

  if (anchor === 'end' && clearanceStart < tooltipDimension) {
    return 'start';
  }

  if (anchor === 'center') {
    const tooltipOverflow = (tooltipDimension - triggerDimension) / 2;

    if (clearanceStart < tooltipOverflow) {
      return 'start';
    }

    if (clearanceEnd < tooltipOverflow) {
      return 'end';
    }
  }

  return anchor;
};

const getAnchor = (
  isVertical: boolean,
  anchor: Align,
  clearance: Clearance,
  tooltipWidth: number,
  tooltipHeight: number,
): Align => {
  if (isVertical) {
    return transformAnchor(anchor, clearance.left, clearance.right, tooltipWidth, clearance.boundingRect.width);
  }

  return transformAnchor(anchor, clearance.top, clearance.bottom, tooltipHeight, clearance.boundingRect.height);
};

const ARROW_SIZE = 7;

const Tooltip = forwardRef<TooltipHandle, TooltipProps>(
  (
    {
      children,
      align = 'center',
      anchor = 'center',
      position = 'top',
      offset = 0,
      width,
      maxWidth,
      interactive = false,
      suppress = false,
      stayOpen = false,
      wrapText = false,
      className = 'tooltip',
      contentClassName = 'tooltip__content',
      wrapperClassName = 'tooltip__wrapper',
      styles,
      content,
      onOpen,
      onClose,
      onClick,
      onMouseLeave,
    },
    ref,
  ) => {
    const [state, setState] = useState<TooltipStates>({
      isOpen: false,
      wasTriggeredClose: false,
      anchor: undefined,
      position: undefined,
      coordinates: undefined,
    });

    const container = useRef<Window>(window);
    const triggerNode = useRef<HTMLDivElement>(null);
    const tooltipNode = useRef<HTMLDivElement>(null);
    const scrollListenerRef = useRef<(() => void) | null>(null);

    // Store refs to avoid stale closures
    const stateRef = useRef(state);
    const propsRef = useRef({stayOpen, onClose});

    // Update refs when values change
    useEffect(() => {
      stateRef.current = state;
    }, [state]);

    useEffect(() => {
      propsRef.current = {stayOpen, onClose};
    }, [stayOpen, onClose]);

    const getCoordinates = useCallback(
      (
        tooltipPosition: Position,
        clearance: Clearance,
        tooltipWidth: number,
        tooltipHeight: number,
      ): Pick<Coordinates, 'left' | 'top'> => {
        let top = null;

        switch (tooltipPosition) {
          case 'left':
            return {
              top: clearance.boundingRect.top + clearance.boundingRect.height / 2,
              left: clearance.boundingRect.left - tooltipWidth + ARROW_SIZE + offset,
            };
          case 'right':
            return {
              top: clearance.boundingRect.top + clearance.boundingRect.height / 2,
              left: clearance.boundingRect.right + offset,
            };
          case 'top':
            top = clearance.boundingRect.top - tooltipHeight + ARROW_SIZE + offset;
            break;
          case 'bottom':
            top = clearance.boundingRect.bottom + offset;
            break;
          default:
        }

        switch (align) {
          case 'start':
            return {
              top: top as number,
              left: clearance.boundingRect.left,
            };
          case 'center':
            return {
              top: top as number,
              left: clearance.boundingRect.left + clearance.boundingRect.width / 2,
            };
          case 'end':
            return {
              top: top as number,
              left: clearance.boundingRect.left + clearance.boundingRect.width - tooltipWidth,
            };
          default:
        }

        return {
          top: 0,
          left: 0,
        };
      },
      [align, offset],
    );

    const getIdealLocation = useCallback(
      (anchorProp: Align, positionProp: Position) => {
        if (triggerNode.current == null || tooltipNode.current == null || anchorProp == null) {
          return {
            anchor: anchorProp,
            position: positionProp,
            coordinates: {left: 0, top: 0},
          };
        }

        const clearance = getNodeClearance(triggerNode.current);
        const tooltipRect = tooltipNode.current.getBoundingClientRect();
        const tooltipHeight = tooltipRect.height + ARROW_SIZE;
        const tooltipWidth = tooltipRect.width + ARROW_SIZE;

        const newPosition = getPosition(positionProp, clearance, tooltipWidth, tooltipHeight);

        return {
          anchor: getAnchor(
            newPosition !== 'left' && newPosition !== 'right',
            anchorProp,
            clearance,
            tooltipWidth,
            tooltipHeight,
          ),
          position: newPosition,
          coordinates: getCoordinates(newPosition, clearance, tooltipWidth, tooltipHeight),
        };
      },
      [getCoordinates],
    );

    // Create a stable dismiss function that doesn't change
    const dismissTooltipInternal = useCallback(() => {
      const currentState = stateRef.current;
      const currentProps = propsRef.current;

      if (currentState.isOpen) {
        setState((prevState) => ({...prevState, isOpen: false}));

        // Remove scroll listener
        if (scrollListenerRef.current && container.current) {
          container.current.removeEventListener('scroll', scrollListenerRef.current);
          scrollListenerRef.current = null;
        }

        if (currentProps.onClose) {
          currentProps.onClose();
        }
      }
    }, []);

    const dismissTooltip = useCallback(
      (forceClose?: boolean) => {
        const currentProps = propsRef.current;

        if (!currentProps.stayOpen || forceClose) {
          dismissTooltipInternal();
        }
      },
      [dismissTooltipInternal],
    );

    const handleTooltipMouseEnter = useCallback(() => {
      if (interactive && !stateRef.current.wasTriggeredClose) {
        setState((prevState) => ({...prevState, isOpen: true}));

        // Add scroll listener if not already added
        if (!scrollListenerRef.current && container.current) {
          // Store the exact same function reference
          const listener = () => dismissTooltipInternal();
          scrollListenerRef.current = listener;
          container.current.addEventListener('scroll', listener);
        }
      }
    }, [interactive, dismissTooltipInternal]);

    const handleTooltipMouseLeave = useCallback(() => {
      dismissTooltip();
    }, [dismissTooltip]);

    const handleMouseEnter = useCallback(
      (forceOpen?: boolean) => {
        if (suppress && !forceOpen) {
          return;
        }

        if (anchor == null || position == null) {
          return;
        }

        const {anchor: newAnchor, position: newPosition, coordinates} = getIdealLocation(anchor, position);

        setState({
          anchor: newAnchor,
          isOpen: true,
          position: newPosition,
          coordinates,
          wasTriggeredClose: false,
        });

        // Add scroll listener if not already added
        if (!scrollListenerRef.current && container.current) {
          // Store the exact same function reference
          const listener = () => dismissTooltipInternal();
          scrollListenerRef.current = listener;
          container.current.addEventListener('scroll', listener);
        }

        if (onOpen) {
          onOpen();
        }
      },
      [suppress, anchor, position, getIdealLocation, dismissTooltipInternal, onOpen],
    );

    const handleMouseLeave = useCallback(() => {
      dismissTooltip();

      if (onMouseLeave) {
        onMouseLeave();
      }
    }, [dismissTooltip, onMouseLeave]);

    const isOpen = useCallback(() => {
      return stateRef.current.isOpen;
    }, []);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        dismissTooltip,
        isOpen,
      }),
      [dismissTooltip, isOpen],
    );

    // Cleanup on unmount
    useEffect(() => {
      const containerElement = container.current;
      return () => {
        if (scrollListenerRef.current && containerElement) {
          containerElement.removeEventListener('scroll', scrollListenerRef.current);
          scrollListenerRef.current = null;
        }
      };
    }, []);

    // Get the anchor and position from state if possible. If not, get it from the props.
    const finalAnchor = state.anchor || anchor;
    const finalPosition = state.position || position;

    const tooltipClasses = classnames(
      className,
      `tooltip--anchor--${finalAnchor}`,
      `tooltip--position--${finalPosition}`,
      `tooltip--align--${align}`,
      {
        'is-interactive': interactive,
        'is-open': state.isOpen,
        'tooltip--no-wrap': !wrapText,
      },
    );

    let tooltipStyle: CSSProperties = {};

    if (state.coordinates) {
      tooltipStyle = {
        left: state.coordinates.left,
        top: state.coordinates.top,
      };
    }

    if (width) {
      tooltipStyle.width = width;
    }

    if (maxWidth) {
      tooltipStyle.maxWidth = maxWidth;
    }

    const appElement = document.getElementById('app') || document.getElementById('storybook-root') || document.body;

    if (appElement == null) {
      return null;
    }

    return (
      <div
        aria-label={typeof content === 'string' ? content : undefined}
        className={classnames(
          wrapperClassName,
          css({
            _focus: {
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            },
          }),
          Array.isArray(styles) ? styles : styles ? [styles] : undefined,
        )}
        tabIndex={0}
        role="button"
        data-testid="tooltip-trigger"
        onClick={onClick}
        onKeyPress={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onClick?.();
          }
        }}
        onFocus={() => handleMouseEnter()}
        onBlur={() => {
          if (!interactive) {
            handleMouseLeave();
          }
        }}
        onMouseEnter={() => handleMouseEnter()}
        onMouseLeave={() => handleMouseLeave()}
        ref={triggerNode}
      >
        {children}
        {createPortal(
          <div
            className={tooltipClasses}
            ref={tooltipNode}
            style={tooltipStyle}
            role="tooltip"
            data-testid="tooltip-content"
            data-visible={state.isOpen ? 'true' : 'false'}
            data-position={state.position || position}
            data-align={align}
            data-wrap={wrapText !== false ? 'true' : 'false'}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className={contentClassName}>{content}</div>
          </div>,
          appElement,
        )}
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
