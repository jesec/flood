import {FC, ReactNode, useRef, useState} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox} from '@client/ui';
import {Error} from '@client/ui/icons';
import SettingStore from '@client/stores/SettingStore';
import TorrentListColumns from '@client/constants/TorrentListColumns';

import type {FloodSettings} from '@shared/types/FloodSettings';

import SortableList from '../../../general/SortableList';
import Tooltip from '../../../general/Tooltip';

import type {ListItem} from '../../../general/SortableList';

interface TorrentListColumnsListProps {
  torrentListViewSize: FloodSettings['torrentListViewSize'];
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

const TorrentListColumnsList: FC<TorrentListColumnsListProps> = ({
  torrentListViewSize,
  onSettingsChange,
}: TorrentListColumnsListProps) => {
  const tooltipRef = useRef<Tooltip>(null);
  const [torrentListColumns, setTorrentListColumns] = useState([
    ...SettingStore.floodSettings.torrentListColumns.filter((column) => TorrentListColumns[column.id] != null).slice(),
    ...Object.keys(TorrentListColumns)
      .filter((key) => SettingStore.floodSettings.torrentListColumns.every((column) => column.id !== key))
      .map((newColumn) => ({
        id: newColumn,
        visible: false,
      })),
  ]);

  const lockedIDs =
    torrentListViewSize === 'expanded' ? ['name', 'eta', 'downRate', 'percentComplete', 'downTotal', 'upRate'] : [];

  return (
    <SortableList
      id="torrent-details"
      className="sortable-list--torrent-details"
      items={torrentListColumns}
      lockedIDs={lockedIDs}
      onMouseDown={(): void => {
        tooltipRef.current?.dismissTooltip();
      }}
      onDrop={(items: Array<ListItem>): void => {
        const newItems = items.slice();
        onSettingsChange({torrentListColumns: newItems as FloodSettings['torrentListColumns']});
        setTorrentListColumns(newItems);
      }}
      renderItem={(item: ListItem, index: number): ReactNode => {
        const {id, visible} = item as FloodSettings['torrentListColumns'][number];
        let checkbox = null;
        let warning = null;

        if (!lockedIDs.includes(id)) {
          checkbox = (
            <span className="sortable-list__content sortable-list__content--secondary">
              <Checkbox
                defaultChecked={visible}
                id={id}
                onClick={(event) => {
                  const changedTorrentListColumns = torrentListColumns.map((column) => ({
                    id: column.id,
                    visible: column.id === id ? (event.target as HTMLInputElement).checked : column.visible,
                  }));
                  onSettingsChange({
                    torrentListColumns: changedTorrentListColumns as FloodSettings['torrentListColumns'],
                  });
                  setTorrentListColumns(changedTorrentListColumns);
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

        const content = (
          <div className="sortable-list__content sortable-list__content__wrapper">
            {warning}
            <span className="sortable-list__content sortable-list__content--primary">
              <Trans id={TorrentListColumns[id]} />
            </span>
            {checkbox}
          </div>
        );

        return content;
      }}
    />
  );
};

export default TorrentListColumnsList;
