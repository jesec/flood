import _ from 'lodash';
import classnames from 'classnames';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import TorrentProperties from '../../constants/TorrentProperties';
import UIStore from '../../stores/UIStore';

const methodsToBind = [
  'getHeadingElements',
  'handleCellMouseDown',
  'handleMouseUp',
  'handleMouseMove',
  'handleWidthChange'
];

const mouseDownStyles = `
  body { user-select: none !important; }
  * { cursor: col-resize !important; }
`;

class TableHeading extends React.Component {
  constructor() {
    super();

    this.focusedCell = null;
    this.focusedCellWidth = null;
    this.isMouseDown = false;
    this.lastMouseX = null;

    methodsToBind.forEach(method => this[method] = this[method].bind(this));

    this.handleWidthChange = _.debounce(this.handleWidthChange, 500);
  }

  componentDidMount() {
    this.tableHeadingX = this.tableHeading.getBoundingClientRect().left;
  }

  handleMouseMove(event) {
    let widthDelta = 0;

    if (this.lastMouseX != null) {
      widthDelta = event.clientX - this.lastMouseX;
    }

    const nextCellWidth = this.focusedCellWidth + widthDelta;

    if (nextCellWidth > 20) {
      this.focusedCellWidth = nextCellWidth;
      this.lastMouseX = event.clientX;
      this.resizeLine.style.transform
        = `translateX(${Math.max(0, event.clientX - this.tableHeadingX + this.props.scrollOffset)}px)`;

      this.handleWidthChange(this.focusedCell, nextCellWidth);
    }
  }

  handleMouseUp(event) {
    UIStore.removeGlobalStyle(mouseDownStyles);
    global.document.removeEventListener('mouseup', this.handleMouseUp);
    global.document.removeEventListener('mousemove', this.handleMouseMove);

    this.focusedCell = null;
    this.focusedCellWidth = null;
    this.isMouseDown = false;
    this.lastMouseX = null;
    this.resizeLine.style.opacity = 0;

    this.handleWidthChange.flush();
  }

  handleCellClick(slug, event) {
    this.props.onCellClick(slug, event);
  }

  handleCellMouseDown(event, slug, width) {
    if (!this.isMouseDown) {
      UIStore.addGlobalStyle(mouseDownStyles);
      global.document.addEventListener('mouseup', this.handleMouseUp);
      global.document.addEventListener('mousemove', this.handleMouseMove);

      this.focusedCell = slug;
      this.focusedCellWidth = width;
      this.isMouseDown = true;
      this.lastMouseX = event.clientX;
      this.resizeLine.style.transform = `translateX(${Math.max(0, event.clientX - this.tableHeadingX + this.props.scrollOffset)}px)`;
      this.resizeLine.style.opacity = 1;
    }
  }

  handleWidthChange(cell, width) {
    this.props.onWidthsChange({[cell]: width});
  }

  getHeadingElements() {
    const {
      defaultWidth,
      defaultPropWidths,
      properties,
      propWidths,
      sortProp
    } = this.props;
    const propertiesCount = properties.length;

    return properties.map(property => {
      const slug = property;
      let handle = null;
      const width = propWidths[slug] || defaultPropWidths[slug] || defaultWidth;

      if (!this.isMouseDown) {
        handle = (
          <span className="table__heading__handle"
            onMouseDown={event => {
              this.handleCellMouseDown(event, slug, width);
            }} />
        );
      }

      const isSortActive = slug === sortProp.property;
      const classes = classnames(
        'table__cell table__heading',
        {
          'table__heading--is-sorted': isSortActive,
          [`table__heading--direction--${sortProp.direction}`]: isSortActive
        }
      );

      const label = (
        <FormattedMessage
          id={TorrentProperties[slug].id}
          defaultMessage={TorrentProperties[slug].defaultMessage} />
      );

      return (
        <div className={classes}
          key={slug}
          onClick={event => this.handleCellClick(slug, event)}
          style={{width: `${width}px`}}>
          <span className="table__heading__label"
            title={this.props.intl.formatMessage({
              id: TorrentProperties[slug].id,
              defaultMessage: TorrentProperties[slug].defaultMessage
            })}>
            {label}
          </span>
          {handle}
        </div>
      );
    });
  }

  render() {
    let dragIndicatorStyle = null;

    return (
      <div className="table__row table__row--heading"
        ref={ref => this.tableHeading = ref}>
        {this.getHeadingElements()}
        <div className="table__heading__resize-line"
          ref={ref => this.resizeLine = ref}
          style={dragIndicatorStyle} />
      </div>
    );
  }
}

export default injectIntl(TableHeading);
