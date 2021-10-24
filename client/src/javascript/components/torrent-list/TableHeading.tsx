import classnames from 'classnames';
import {forwardRef, MutableRefObject, ReactElement, useRef, useState} from 'react';
import {observer} from 'mobx-react';
import {Trans, useLingui} from '@lingui/react';
import {useEnsuredForwardedRef} from 'react-use';

import TorrentListColumns, {TorrentListColumn} from '../../constants/TorrentListColumns';
import SettingStore from '../../stores/SettingStore';
import UIStore from '../../stores/UIStore';

const pointerDownStyles = `
  body { user-select: none !important; }
  * { cursor: col-resize !important; }
`;

interface TableHeadingProps {
  onCellClick: (column: TorrentListColumn) => void;
  onCellFocus: () => void;
  onWidthsChange: (column: TorrentListColumn, width: number) => void;
}

const TableHeading = observer(
  forwardRef<HTMLDivElement, TableHeadingProps>(
    ({onCellClick, onCellFocus, onWidthsChange}: TableHeadingProps, ref) => {
      const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

      const focusedCell = useRef<TorrentListColumn>();
      const focusedCellWidth = useRef<number>();
      const lastPointerX = useRef<number>();
      const tableHeading = useEnsuredForwardedRef<HTMLDivElement>(ref as MutableRefObject<HTMLDivElement>);
      const resizeLine = useRef<HTMLDivElement>(null);

      const {i18n} = useLingui();

      const handlePointerMove = (event: PointerEvent) => {
        let widthDelta = 0;
        if (lastPointerX.current != null) {
          widthDelta = event.clientX - lastPointerX.current;
        }

        let nextCellWidth = 20;
        if (focusedCellWidth.current != null) {
          nextCellWidth = focusedCellWidth.current + widthDelta;
        }

        if (nextCellWidth > 20) {
          focusedCellWidth.current = nextCellWidth;
          lastPointerX.current = event.clientX;
          if (resizeLine.current != null && tableHeading.current != null) {
            resizeLine.current.style.transform = `translate(${Math.max(0, event.clientX)}px, ${
              tableHeading.current.getBoundingClientRect().top
            }px)`;
          }
        }
      };

      const handlePointerUp = () => {
        UIStore.removeGlobalStyle(pointerDownStyles);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointermove', handlePointerMove);

        setIsPointerDown(false);
        lastPointerX.current = undefined;

        if (resizeLine.current != null) {
          resizeLine.current.style.opacity = '0';
        }

        if (focusedCell.current != null && focusedCellWidth.current != null) {
          onWidthsChange(focusedCell.current, focusedCellWidth.current);
        }

        focusedCell.current = undefined;
        focusedCellWidth.current = undefined;
      };

      return (
        <div className="table__row table__row--heading" role="row" ref={tableHeading}>
          {SettingStore.floodSettings.torrentListColumns.reduce((accumulator: Array<ReactElement>, {id, visible}) => {
            if (!visible) {
              return accumulator;
            }

            const labelID = TorrentListColumns[id];
            if (labelID == null) {
              return accumulator;
            }

            let handle = null;
            const width = SettingStore.floodSettings.torrentListColumnWidths[id] || 100;

            if (!isPointerDown) {
              handle = (
                <span
                  className="table__heading__handle"
                  onPointerDown={(event) => {
                    if (!isPointerDown && resizeLine.current != null && tableHeading.current != null) {
                      setIsPointerDown(true);

                      focusedCell.current = id;
                      focusedCellWidth.current = width;
                      lastPointerX.current = event.clientX;

                      window.addEventListener('pointerup', handlePointerUp);
                      window.addEventListener('pointermove', handlePointerMove);
                      UIStore.addGlobalStyle(pointerDownStyles);

                      resizeLine.current.style.transform = `translate(${Math.max(0, event.clientX)}px, ${
                        tableHeading.current.getBoundingClientRect().top
                      }px)`;
                      resizeLine.current.style.opacity = '1';
                    }
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
              <button
                className={classes}
                css={{
                  textAlign: 'left',
                  ':focus': {
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  },
                }}
                role="columnheader"
                aria-sort={
                  isSortActive
                    ? SettingStore.floodSettings.sortTorrents.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                type="button"
                key={id}
                onClick={() => onCellClick(id)}
                onFocus={() => onCellFocus()}
                style={{
                  width: `${width}px`,
                }}
              >
                <span className="table__heading__label" title={i18n._(labelID)}>
                  <Trans id={labelID} />
                </span>
                {handle}
              </button>,
            );

            return accumulator;
          }, [])}
          <div className="table__cell table__heading table__heading--fill" />
          <div className="table__heading__resize-line" ref={resizeLine} />
        </div>
      );
    },
  ),
);

export default TableHeading;
