import classnames from 'classnames';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';
import * as React from 'react';

import TorrentListColumns, {TorrentListColumn} from '../../constants/TorrentListColumns';
import SettingStore from '../../stores/SettingStore';
import UIStore from '../../stores/UIStore';

const pointerDownStyles = `
  body { user-select: none !important; }
  * { cursor: col-resize !important; }
`;

interface TableHeadingProps extends WrappedComponentProps {
  onCellClick: (column: TorrentListColumn) => void;
  onWidthsChange: (column: TorrentListColumn, width: number) => void;
  setRef?: React.RefCallback<HTMLDivElement>;
}

@observer
class TableHeading extends React.Component<TableHeadingProps> {
  focusedCell: TorrentListColumn | null = null;
  focusedCellWidth: number | null = null;
  isPointerDown = false;
  lastPointerX: number | null = null;
  tableHeading: HTMLDivElement | null = null;
  resizeLine: HTMLDivElement | null = null;

  getHeadingElements() {
    const {intl, onCellClick} = this.props;

    return SettingStore.floodSettings.torrentListColumns.reduce((accumulator: React.ReactNodeArray, {id, visible}) => {
      if (!visible) {
        return accumulator;
      }

      const labelID = TorrentListColumns[id]?.id;
      if (labelID == null) {
        return accumulator;
      }

      let handle = null;
      const width = SettingStore.floodSettings.torrentListColumnWidths[id] || 100;

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

      const isSortActive = id === SettingStore.floodSettings.sortTorrents.property;
      const classes = classnames('table__cell table__heading', {
        'table__heading--is-sorted': isSortActive,
        [`table__heading--direction--${SettingStore.floodSettings.sortTorrents.direction}`]: isSortActive,
      });

      accumulator.push(
        <div className={classes} key={id} onClick={() => onCellClick(id)} style={{width: `${width}px`}}>
          <span
            className="table__heading__label"
            title={intl.formatMessage({
              id: labelID,
            })}>
            <FormattedMessage id={labelID} />
          </span>
          {handle}
        </div>,
      );

      return accumulator;
    }, []);
  }

  handlePointerMove = (event: PointerEvent) => {
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
      if (this.resizeLine != null && this.tableHeading != null) {
        this.resizeLine.style.transform = `translate(${Math.max(0, event.clientX)}px, ${
          this.tableHeading.getBoundingClientRect().top
        }px)`;
      }
    }
  };

  handlePointerUp = () => {
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
  };

  handlePointerDown = (event: React.PointerEvent, slug: TorrentListColumn, width: number) => {
    if (!this.isPointerDown && this.resizeLine != null && this.tableHeading != null) {
      global.document.addEventListener('pointerup', this.handlePointerUp);
      global.document.addEventListener('pointermove', this.handlePointerMove);
      UIStore.addGlobalStyle(pointerDownStyles);

      this.focusedCell = slug;
      this.focusedCellWidth = width;
      this.isPointerDown = true;
      this.lastPointerX = event.clientX;
      this.resizeLine.style.transform = `translate(${Math.max(0, event.clientX)}px, ${
        this.tableHeading.getBoundingClientRect().top
      }px)`;
      this.resizeLine.style.opacity = '1';
    }
  };

  render() {
    const {setRef} = this.props;

    return (
      <div
        className="table__row table__row--heading"
        ref={(ref) => {
          this.tableHeading = ref;
          if (setRef != null) {
            setRef(ref);
          }
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
