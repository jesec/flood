import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import Portal from './Portal';

const ARROW_SIZE = 7;
const METHODS_TO_BIND = [
  'dismissTooltip',
  'getIdealLocation',
  'handleMouseEnter',
  'handleMouseLeave',
  'handleTooltipMouseEnter',
  'handleTooltipMouseLeave',
  'triggerClose'
];

class Tooltip extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.container = null;
    this.state = {isOpen: false, wasTriggeredClose: false};
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  handleMouseEnter(options = {}) {
    let {props} = this;

    if (props.suppress && !options.forceOpen) {
      return;
    }

    let {anchor, position, coordinates} = this.getIdealLocation(
      props.anchor,
      props.position
    );

    this.setState({
      anchor,
      isOpen: true,
      position,
      coordinates,
      wasTriggeredClose: false
    });
    this.addScrollListener();
  }

  handleMouseLeave() {
    this.dismissTooltip();
  }

  handleTooltipMouseEnter() {
    if (this.props.interactive && !this.state.wasTriggeredClose) {
      this.setState({isOpen: true});
      this.addScrollListener();
    }
  }

  handleTooltipMouseLeave() {
    this.dismissTooltip();
  }

  addScrollListener() {
    if (!this.container) {
      this.container = this.props.scrollContainer;
    }

    this.container.addEventListener('scroll', this.dismissTooltip);
  }

  dismissTooltip(options = {}) {
    if ((!this.props.stayOpen || options.forceClose) && this.state.isOpen) {
      this.setState({isOpen: false});
      this.removeScrollListener();
    }
  }

  getAnchor(isVertical, anchor, clearance, tooltipWidth, tooltipHeight) {

    if (isVertical) {
      return this.transformAnchor(anchor, clearance.left, clearance.right,
        tooltipWidth, clearance.boundingRect.width);
    }

    return this.transformAnchor(anchor, clearance.top, clearance.bottom,
      tooltipHeight, clearance.boundingRect.height);
  }

  getCoordinates(position, clearance, tooltipWidth, tooltipHeight) {
    let {offset} = this.props;
    // Calculate the coordinates of the tooltip content.
    if (position === 'top') {
      return {
        left: clearance.boundingRect.left + clearance.boundingRect.width / 2,
        top: clearance.boundingRect.top - tooltipHeight + ARROW_SIZE + offset
      };
    } else if (position === 'right') {
      return {
        left: clearance.boundingRect.right + offset,
        top: clearance.boundingRect.top + clearance.boundingRect.height / 2
      };
    } else if (position === 'bottom') {
      return {
        left: clearance.boundingRect.left + clearance.boundingRect.width / 2,
        top: clearance.boundingRect.bottom + offset
      };
    }

    return {
      left: clearance.boundingRect.left - tooltipWidth + ARROW_SIZE + offset,
      top: clearance.boundingRect.top + clearance.boundingRect.height / 2
    };
  }

  isVertical(position) {
    return position !== 'left' && position !== 'right';
  }

  getPosition(position, clearance, tooltipWidth, tooltipHeight) {
    // Change the position if the tooltip will be rendered off the screen.
    if (position === 'left' && clearance.left < tooltipWidth) {
      position = 'right';
    } else if (position === 'right' && clearance.right < tooltipWidth) {
      position = 'left';
    }

    if (position === 'top' && clearance.top < tooltipHeight) {
      position = 'bottom';
    } else if (position === 'bottom' && clearance.bottom < tooltipHeight) {
      position = 'top';
    }

    return position;
  }

  getIdealLocation(anchor, position) {
    let clearance = this.getNodeClearance(this.refs.triggerNode);
    let isVertical = this.isVertical(position);
    let tooltipRect = this.refs.tooltipNode.getBoundingClientRect();
    let tooltipHeight = tooltipRect.height + ARROW_SIZE;
    let tooltipWidth = tooltipRect.width + ARROW_SIZE;

    anchor = this.getAnchor(isVertical, anchor, clearance, tooltipWidth,
      tooltipHeight);
    position = this.getPosition(position, clearance, tooltipWidth,
      tooltipHeight);

    let coordinates = this.getCoordinates(position, clearance, tooltipWidth,
      tooltipHeight);

    return {anchor, position, coordinates};
  }

  getNodeClearance(domNode) {
    let viewportHeight = Math.max(document.documentElement.clientHeight || 0,
      window.innerHeight || 0);
    let viewportWidth = Math.max(document.documentElement.clientWidth || 0,
      window.innerWidth || 0);
    let boundingRect = domNode.getBoundingClientRect();

    return {
      bottom: viewportHeight - boundingRect.bottom,
      left: boundingRect.left,
      right: viewportWidth - boundingRect.right,
      top: boundingRect.top,
      boundingRect
    };
  }

  removeScrollListener() {
    if (this.container) {
      this.container.removeEventListener('scroll', this.dismissTooltip);
    }
  }

  triggerClose() {
    this.setState({wasTriggeredClose: true});
    this.dismissTooltip({forceClose: true});
  }

  triggerOpen() {
    this.handleMouseEnter({forceOpen: true});
  }

  transformAnchor(anchor, clearanceStart, clearanceEnd, tooltipDimension,
    triggerDimension) {
    // Change the provided anchor based on the clearance available.
    if (anchor === 'start' && clearanceEnd < tooltipDimension) {
      return 'end';
    }

    if (anchor === 'end' && clearanceStart < tooltipDimension) {
      return 'start';
    }

    if (anchor === 'center') {
      let tooltipOverflow = (tooltipDimension - triggerDimension) / 2;

      if (clearanceStart < tooltipOverflow) {
        return 'start';
      }

      if (clearanceEnd < tooltipOverflow) {
        return 'end';
      }
    }

    return anchor;
  }

  render() {
    let {props, state} = this;
    let tooltipStyle = {};

    // Get the anchor and position from state if possible. If not, get it from
    // the props.
    let anchor = state.anchor || props.anchor;
    let position = state.position || props.position;
    // Pass along any props that aren't specific to the Tooltip.
    let elementProps = _.omit(props, Object.keys(Tooltip.propTypes));

    let tooltipClasses = classnames(props.className,
      `tooltip--anchor--${anchor}`, `tooltip--position--${position}`, {
        'is-interactive': props.interactive,
        'is-open': state.isOpen,
        'tooltip--no-wrap': !props.wrapText
      }
    );

    if (state.coordinates) {
      tooltipStyle = {
        left: state.coordinates.left,
        top: state.coordinates.top
      };
    }

    if (props.width) {
      tooltipStyle.width = props.width;
    }

    if (props.maxWidth) {
      tooltipStyle.maxWidth = props.maxWidth;
    }

    return (
      <props.elementTag className={props.wrapperClassName}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        {...elementProps} ref="triggerNode">
        {props.children}
        <Portal>
          <div className={tooltipClasses} ref="tooltipNode"
            style={tooltipStyle} onMouseEnter={this.handleTooltipMouseEnter}
            onMouseLeave={this.handleTooltipMouseLeave}>
            <div className={props.contentClassName}>
              {props.content}
            </div>
          </div>
        </Portal>
      </props.elementTag>
    );
  }
}

Tooltip.defaultProps = {
  anchor: 'center',
  className: 'tooltip',
  contentClassName: 'tooltip__content',
  elementTag: 'div',
  interactive: false,
  offset: 0,
  position: 'top',
  scrollContainer: window,
  stayOpen: false,
  suppress: false,
  wrapperClassName: 'tooltip__wrapper',
  wrapText: false
};

Tooltip.propTypes = {
  anchor: React.PropTypes.oneOf(['start', 'center', 'end']),
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.string,
  contentClassName: React.PropTypes.string,
  content: React.PropTypes.node.isRequired,
  elementTag: React.PropTypes.string,
  interactive: React.PropTypes.bool,
  maxWidth: React.PropTypes.oneOfType([React.PropTypes.number,
    React.PropTypes.string]),
  offset: React.PropTypes.number,
  position: React.PropTypes.oneOf(['top', 'bottom', 'right', 'left']),
  scrollContainer: React.PropTypes.oneOfType([React.PropTypes.object,
    React.PropTypes.string]),
  stayOpen: React.PropTypes.bool,
  suppress: React.PropTypes.bool,
  width: React.PropTypes.number,
  wrapperClassName: React.PropTypes.string,
  wrapText: React.PropTypes.bool
};

export default Tooltip;
