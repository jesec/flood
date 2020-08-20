import classnames from 'classnames';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import TorrentProperties from '../../constants/TorrentProperties';
import UIStore from '../../stores/UIStore';

const methodsToBind = [
  'getHeadingElements',
  'handleCellPointerDown',
  'handlePointerUp',
  'handlePointerMove',
  'updateCellWidth',
];

const pointerDownStyles = `
  body { user-select: none !important; }
  * { cursor: col-resize !important; }
`;

class TableHeading extends React.Component {
  constructor() {
    super();

    this.focusedCell = null;
    this.focusedCellWidth = null;
    this.isPointerDown = false;
    this.lastPointerX = null;

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.tableHeadingX = this.tableHeading.getBoundingClientRect().left;
  }

  handlePointerMove(event) {
    let widthDelta = 0;

    if (this.lastPointerX != null) {
      widthDelta = event.clientX - this.lastPointerX;
    }

    const nextCellWidth = this.focusedCellWidth + widthDelta;

    if (nextCellWidth > 20) {
      this.focusedCellWidth = nextCellWidth;
      this.lastPointerX = event.clientX;
      this.resizeLine.style.transform = `translateX(${Math.max(
        0,
        event.clientX - this.tableHeadingX + this.props.scrollOffset,
      )}px)`;
    }
  }

  handlePointerUp() {
    UIStore.removeGlobalStyle(pointerDownStyles);
    global.document.removeEventListener('pointerup', this.handlePointerUp);
    global.document.removeEventListener('pointermove', this.handlePointerMove);

    this.isPointerDown = false;
    this.lastPointerX = null;
    this.resizeLine.style.opacity = 0;

    this.updateCellWidth(this.focusedCell, this.focusedCellWidth);

    this.focusedCell = null;
    this.focusedCellWidth = null;
  }

  handleCellClick(slug, event) {
    this.props.onCellClick(slug, event);
  }

  handleCellPointerDown(event, slug, width) {
    if (!this.isPointerDown) {
      UIStore.addGlobalStyle(pointerDownStyles);
      global.document.addEventListener('pointerup', this.handlePointerUp);
      global.document.addEventListener('pointermove', this.handlePointerMove);

      this.focusedCell = slug;
      this.focusedCellWidth = width;
      this.isPointerDown = true;
      this.lastPointerX = event.clientX;
      this.resizeLine.style.transform = `translateX(${Math.max(
        0,
        event.clientX - this.tableHeadingX + this.props.scrollOffset,
      )}px)`;
      this.resizeLine.style.opacity = 1;
    }
  }

  updateCellWidth(cell, width) {
    this.props.onWidthsChange({[cell]: width});
  }

  getHeadingElements() {
    const {defaultWidth, defaultPropWidths, columns, propWidths, sortProp} = this.props;

    return columns.reduce((accumulator, {id, visible}) => {
      if (!visible) {
        return accumulator;
      }

      let handle = null;
      const width = propWidths[id] || defaultPropWidths[id] || defaultWidth;

      if (!this.isPointerDown) {
        handle = (
          <span
            className="table__heading__handle"
            onPointerDown={(event) => {
              this.handleCellPointerDown(event, id, width);
            }}
          />
        );
      }

      const isSortActive = id === sortProp.property;
      const classes = classnames('table__cell table__heading', {
        'table__heading--is-sorted': isSortActive,
        [`table__heading--direction--${sortProp.direction}`]: isSortActive,
      });

      const label = <FormattedMessage id={TorrentProperties[id].id} />;

      accumulator.push(
        <div
          className={classes}
          key={id}
          onClick={(event) => this.handleCellClick(id, event)}
          style={{width: `${width}px`}}>
          <span
            className="table__heading__label"
            title={this.props.intl.formatMessage({
              id: TorrentProperties[id].id,
            })}>
            {label}
          </span>
          {handle}
        </div>,
      );

      return accumulator;
    }, []);
  }

  render() {
    return (
      <div
        className="table__row table__row--heading"
        ref={(ref) => {
          this.tableHeading = ref;
        }}>
        {this.getHeadingElements()}
        <div className="table__cell table__heading table__heading--fill" />
        <div
          className="table__heading__resize-line"
          ref={(ref) => {
            this.resizeLine = ref;
          }}
        />
      </div>
    );
  }
}

export default injectIntl(TableHeading);
