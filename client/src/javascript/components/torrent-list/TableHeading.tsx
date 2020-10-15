import classnames from 'classnames';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {FloodSettings} from '@shared/types/FloodSettings';

import TorrentListColumns, {TorrentListColumn} from '../../constants/TorrentListColumns';
import UIStore from '../../stores/UIStore';

const pointerDownStyles = `
  body { user-select: none !important; }
  * { cursor: col-resize !important; }
`;

interface TableHeadingProps extends WrappedComponentProps {
  columns: FloodSettings['torrentListColumns'];
  columnWidths: FloodSettings['torrentListColumnWidths'];
  sortProp: FloodSettings['sortTorrents'];
  scrollOffset: number;
  onCellClick: (column: TorrentListColumn) => void;
  onWidthsChange: (column: TorrentListColumn, width: number) => void;
}

class TableHeading extends React.PureComponent<TableHeadingProps> {
  focusedCell: TorrentListColumn | null = null;
  focusedCellWidth: number | null = null;
  isPointerDown = false;
  lastPointerX: number | null = null;
  tableHeading: HTMLDivElement | null = null;
  resizeLine: HTMLDivElement | null = null;
  tableHeadingX = 0;

  constructor(props: TableHeadingProps) {
    super(props);

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
  }

  componentDidMount() {
    if (this.tableHeading != null) {
      this.tableHeadingX = this.tableHeading.getBoundingClientRect().left;
    }
  }

  getHeadingElements() {
    const {intl, columns, columnWidths, sortProp, onCellClick} = this.props;

    return columns.reduce((accumulator: React.ReactNodeArray, {id, visible}) => {
      if (!visible) {
        return accumulator;
      }

      let handle = null;
      const width = columnWidths[id] || defaultFloodSettings.torrentListColumnWidths[id];

      if (!this.isPointerDown) {
        handle = (
          <span
            className="table__heading__handle"
            onPointerDown={(event) => {
              this.handlePointerDown(event, id, width);
            }}
          />
        );
      }

      const isSortActive = id === sortProp.property;
      const classes = classnames('table__cell table__heading', {
        'table__heading--is-sorted': isSortActive,
        [`table__heading--direction--${sortProp.direction}`]: isSortActive,
      });

      const label = <FormattedMessage id={TorrentListColumns[id].id} />;

      accumulator.push(
        <div className={classes} key={id} onClick={() => onCellClick(id)} style={{width: `${width}px`}}>
          <span
            className="table__heading__label"
            title={intl.formatMessage({
              id: TorrentListColumns[id].id,
            })}>
            {label}
          </span>
          {handle}
        </div>,
      );

      return accumulator;
    }, []);
  }

  handlePointerMove(event: PointerEvent) {
    let widthDelta = 0;
    if (this.lastPointerX != null) {
      widthDelta = event.clientX - this.lastPointerX;
    }

    let nextCellWidth = 20;
    if (this.focusedCellWidth != null) {
      nextCellWidth = this.focusedCellWidth + widthDelta;
    }

    if (nextCellWidth > 20) {
      this.focusedCellWidth = nextCellWidth;
      this.lastPointerX = event.clientX;
      if (this.resizeLine != null) {
        this.resizeLine.style.transform = `translateX(${Math.max(
          0,
          event.clientX - this.tableHeadingX + this.props.scrollOffset,
        )}px)`;
      }
    }
  }

  handlePointerUp() {
    UIStore.removeGlobalStyle(pointerDownStyles);
    global.document.removeEventListener('pointerup', this.handlePointerUp);
    global.document.removeEventListener('pointermove', (e) => this.handlePointerMove(e));

    this.isPointerDown = false;
    this.lastPointerX = null;

    if (this.resizeLine != null) {
      this.resizeLine.style.opacity = '0';
    }

    if (this.focusedCell != null && this.focusedCellWidth != null) {
      this.props.onWidthsChange(this.focusedCell, this.focusedCellWidth);
    }

    this.focusedCell = null;
    this.focusedCellWidth = null;
  }

  handlePointerDown(event: React.PointerEvent, slug: TorrentListColumn, width: number) {
    if (!this.isPointerDown && this.resizeLine != null) {
      global.document.addEventListener('pointerup', this.handlePointerUp);
      global.document.addEventListener('pointermove', this.handlePointerMove);
      UIStore.addGlobalStyle(pointerDownStyles);

      this.focusedCell = slug;
      this.focusedCellWidth = width;
      this.isPointerDown = true;
      this.lastPointerX = event.clientX;
      this.resizeLine.style.transform = `translateX(${Math.max(
        0,
        event.clientX - this.tableHeadingX + this.props.scrollOffset,
      )}px)`;
      this.resizeLine.style.opacity = '1';
    }
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
