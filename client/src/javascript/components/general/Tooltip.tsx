import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

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
  align?: Align;
  anchor?: Align;
  position?: Position;
  offset?: number;
  width: number;
  maxWidth: number;
  interactive?: boolean;
  suppress?: boolean;
  stayOpen?: boolean;
  wrapText?: boolean;
  className?: string;
  contentClassName?: string;
  wrapperClassName?: string;
  content: React.ReactNode;
  onOpen: () => void;
  onClose: () => void;
  onClick: () => void;
  onMouseLeave: () => void;
}

interface TooltipStates {
  anchor?: Align;
  coordinates?: Pick<Coordinates, 'left' | 'top'>;
  position?: Position;
  isOpen: boolean;
  wasTriggeredClose: boolean;
}

const getNodeClearance = (domNode: HTMLDivElement) => {
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

class Tooltip extends React.Component<TooltipProps, TooltipStates> {
  container = window;
  triggerNode: HTMLDivElement | null = null;
  tooltipNode: HTMLDivElement | null = null;

  static defaultProps: Partial<TooltipProps> = {
    align: 'center',
    anchor: 'center',
    className: 'tooltip',
    contentClassName: 'tooltip__content',
    interactive: false,
    offset: 0,
    position: 'top',
    stayOpen: false,
    suppress: false,
    wrapperClassName: 'tooltip__wrapper',
    wrapText: false,
  };

  constructor(props: TooltipProps) {
    super(props);

    this.dismissTooltip = this.dismissTooltip.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleTooltipMouseEnter = this.handleTooltipMouseEnter.bind(this);
    this.handleTooltipMouseLeave = this.handleTooltipMouseLeave.bind(this);
    this.isOpen = this.isOpen.bind(this);
    this.triggerClose = this.triggerClose.bind(this);

    this.state = {isOpen: false, wasTriggeredClose: false};
  }

  componentWillUnmount(): void {
    this.removeScrollListener();
  }

  getCoordinates(
    position: Position,
    clearance: Clearance,
    tooltipWidth: number,
    tooltipHeight: number,
  ): Pick<Coordinates, 'left' | 'top'> {
    const {align, offset = 0} = this.props;
    let top = null;

    switch (position) {
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
  }

  getIdealLocation(
    anchor: Align,
    position: Position,
  ): {
    anchor: Align;
    position: Position;
    coordinates: Pick<Coordinates, 'left' | 'top'>;
  } {
    if (this.triggerNode == null || this.tooltipNode == null || anchor == null) {
      return {
        anchor,
        position,
        coordinates: {left: 0, top: 0},
      };
    }

    const clearance = getNodeClearance(this.triggerNode);
    const tooltipRect = this.tooltipNode.getBoundingClientRect();
    const tooltipHeight = tooltipRect.height + ARROW_SIZE;
    const tooltipWidth = tooltipRect.width + ARROW_SIZE;

    const newPosition = getPosition(position, clearance, tooltipWidth, tooltipHeight);

    return {
      anchor: getAnchor(
        newPosition !== 'left' && newPosition !== 'right',
        anchor,
        clearance,
        tooltipWidth,
        tooltipHeight,
      ),
      position: newPosition,
      coordinates: this.getCoordinates(newPosition, clearance, tooltipWidth, tooltipHeight),
    };
  }

  dismissTooltip(forceClose?: boolean): void {
    const {stayOpen, onClose} = this.props;
    const {isOpen} = this.state;

    if ((!stayOpen || forceClose) && isOpen) {
      this.setState({isOpen: false});
      this.removeScrollListener();

      if (onClose) {
        onClose();
      }
    }
  }

  addScrollListener(): void {
    this.container.addEventListener('scroll', (_e) => this.dismissTooltip());
  }

  handleTooltipMouseEnter(): void {
    const {interactive} = this.props;
    const {wasTriggeredClose} = this.state;

    if (interactive && !wasTriggeredClose) {
      this.setState({isOpen: true});
      this.addScrollListener();
    }
  }

  handleTooltipMouseLeave(): void {
    this.dismissTooltip();
  }

  handleMouseEnter(forceOpen?: boolean): void {
    const {props} = this;

    if (props.suppress && !forceOpen) {
      return;
    }

    if (props.anchor == null || props.position == null) {
      return;
    }

    const {anchor, position, coordinates} = this.getIdealLocation(props.anchor, props.position);

    this.setState({
      anchor,
      isOpen: true,
      position,
      coordinates,
      wasTriggeredClose: false,
    });
    this.addScrollListener();

    if (props.onOpen) {
      props.onOpen();
    }
  }

  handleMouseLeave(): void {
    this.dismissTooltip();

    const {onMouseLeave} = this.props;

    if (onMouseLeave) {
      onMouseLeave();
    }
  }

  isOpen(): boolean {
    const {isOpen} = this.state;

    return isOpen;
  }

  removeScrollListener(): void {
    if (this.container) {
      this.container.removeEventListener('scroll', (_e) => this.dismissTooltip());
    }
  }

  triggerClose(): void {
    this.setState({wasTriggeredClose: true});
    this.dismissTooltip(true);
  }

  triggerOpen(): void {
    this.handleMouseEnter(true);
  }

  render(): React.ReactNode {
    const {
      anchor: defaultAnchor,
      position: defaultPosition,
      children,
      align,
      className,
      interactive,
      wrapText,
      width,
      maxWidth,
      wrapperClassName,
      contentClassName,
      content,
      onClick,
    } = this.props;
    const {anchor: stateAnchor, position: statePosition, coordinates, isOpen} = this.state;
    let tooltipStyle: React.CSSProperties = {};

    // Get the anchor and position from state if possible. If not, get it from
    // the props.
    const anchor = stateAnchor || defaultAnchor;
    const position = statePosition || defaultPosition;

    const tooltipClasses = classnames(
      className,
      `tooltip--anchor--${anchor}`,
      `tooltip--position--${position}`,
      `tooltip--align--${align}`,
      {
        'is-interactive': interactive,
        'is-open': isOpen,
        'tooltip--no-wrap': !wrapText,
      },
    );

    if (coordinates) {
      tooltipStyle = {
        left: coordinates.left,
        top: coordinates.top,
      };
    }

    if (width) {
      tooltipStyle.width = width;
    }

    if (maxWidth) {
      tooltipStyle.maxWidth = maxWidth;
    }

    const appElement = document.getElementById('app');

    if (appElement == null) {
      return null;
    }

    return (
      <div
        className={wrapperClassName}
        onClick={onClick}
        onMouseEnter={(_e) => this.handleMouseEnter()}
        onMouseLeave={(_e) => this.handleMouseLeave()}
        ref={(ref) => {
          this.triggerNode = ref;
        }}>
        {children}
        {ReactDOM.createPortal(
          <div
            className={tooltipClasses}
            ref={(ref) => {
              this.tooltipNode = ref;
            }}
            style={tooltipStyle}
            onMouseEnter={this.handleTooltipMouseEnter}
            onMouseLeave={this.handleTooltipMouseLeave}>
            <div className={contentClassName}>{content}</div>
          </div>,
          appElement,
        )}
      </div>
    );
  }
}

export default Tooltip;
