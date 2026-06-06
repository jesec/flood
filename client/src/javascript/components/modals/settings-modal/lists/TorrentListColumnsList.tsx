import {FC, useRef, useState} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox} from '@client/ui';
import {Error} from '@client/ui/icons';
import SettingStore from '@client/stores/SettingStore';
import TorrentListColumns from '@client/constants/TorrentListColumns';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

import SortableList from '../../../general/SortableList';
import Tooltip, {TooltipHandle} from '../../../general/Tooltip';

interface TorrentListColumnsListProps {
  torrentListViewSize: FloodSettings['torrentListViewSize'];
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

const TorrentListColumnsList: FC<TorrentListColumnsListProps> = ({
  torrentListViewSize,
  onSettingsChange,
}: TorrentListColumnsListProps) => {
  const tooltipRef = useRef<TooltipHandle>(null);

  const [torrentListColumns, setTorrentListColumns] = useState([
    ...SettingStore.floodSettings.torrentListColumns.filter((column) => TorrentListColumns[column.id] != null).slice(),
    ...Object.keys(TorrentListColumns)
      .filter((key) => SettingStore.floodSettings.torrentListColumns.every((column) => column.id !== key))
      .map((newColumn) => ({
        id: newColumn,
        visible: false,
      })),
  ]);
  const [showProgressPercent, setShowProgressPercent] = useState(
    SettingStore.floodSettings.torrentListShowProgressPercent,
  );

  const torrentListColumnVisiblity = torrentListColumns.reduce((memo, {id, visible}) => {
    memo[id] = visible;
    return memo;
  }, {} as Record<string, boolean>);

  const lockedIDs =
    torrentListViewSize === 'expanded' ? ['name', 'eta', 'downRate', 'percentComplete', 'downTotal', 'upRate'] : [];
  const hasPercentChild = (id: string) =>
    id === 'percentComplete' && torrentListViewSize === 'condensed' && torrentListColumnVisiblity.percentComplete;

  return (
    <SortableList
      className="sortable-list--torrent-details"
      items={torrentListColumns.map(({id}) => id)}
      lockedIDs={lockedIDs}
      getItemClassName={(id) => (hasPercentChild(id) ? 'sortable-list__item--stacked' : undefined)}
      onMouseDown={(): void => {
        tooltipRef.current?.dismissTooltip();
      }}
      onDrop={(items) => {
        const newItems = items.map((id) => ({id, visible: torrentListColumnVisiblity[id]}));
        onSettingsChange({torrentListColumns: newItems as FloodSettings['torrentListColumns']});
        setTorrentListColumns(newItems);
      }}
      renderItem={(id, index) => {
        let checkbox = null;
        let warning = null;

        if (!lockedIDs.includes(id)) {
          checkbox = (
            <span className="sortable-list__content sortable-list__content--secondary">
              <Checkbox
                checked={torrentListColumnVisiblity[id]}
                id={id}
                onClick={(event) => {
                  torrentListColumnVisiblity[id] = (event.target as HTMLInputElement).checked;

                  const changedTorrentListColumns = torrentListColumns.map((column) => ({
                    id: column.id,
                    visible: column.id === id ? (event.target as HTMLInputElement).checked : column.visible,
                  }));

                  setTorrentListColumns(changedTorrentListColumns);
                  onSettingsChange({
                    torrentListColumns: changedTorrentListColumns as FloodSettings['torrentListColumns'],
                  });
                }}
              >
                <Trans id="settings.ui.torrent.details.enabled" />
              </Checkbox>
            </span>
          );
        }

        if (id === 'tags' && torrentListViewSize === 'expanded' && index < torrentListColumns.length - 1) {
          const tooltipContent = <Trans id="settings.ui.torrent.details.tags.placement" />;

          warning = (
            <Tooltip
              className="tooltip tooltip--is-error"
              content={tooltipContent}
              offset={-5}
              ref={tooltipRef}
              width={200}
              wrapperClassName="sortable-list__content sortable-list__content--secondary tooltip__wrapper"
              wrapText
            >
              <Error />
            </Tooltip>
          );
        }

        const showPercentChild = hasPercentChild(id);

        const content = (
          <div
            className={`sortable-list__content sortable-list__content__wrapper${
              showPercentChild ? ' sortable-list__content__wrapper--stacked' : ''
            }`}
          >
            <div className="sortable-list__content__row">
              {warning}
              <span className="sortable-list__content sortable-list__content--primary">
                <Trans id={TorrentListColumns[id as TorrentListColumn]} />
              </span>
              {checkbox}
            </div>
            {showPercentChild ? (
              <div className="sortable-list__content__child">
                <Checkbox
                  checked={showProgressPercent}
                  id="torrentListShowProgressPercent"
                  onClick={(event) => {
                    const isChecked = (event.target as HTMLInputElement).checked;
                    setShowProgressPercent(isChecked);
                    onSettingsChange({torrentListShowProgressPercent: isChecked});
                  }}
                >
                  <Trans id="settings.ui.torrent.list.progress.percent" />
                </Checkbox>
              </div>
            ) : null}
          </div>
        );

        return content;
      }}
    />
  );
};

export default TorrentListColumnsList;
