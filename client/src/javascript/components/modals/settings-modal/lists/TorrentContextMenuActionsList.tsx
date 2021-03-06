import {FC, useState} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox} from '@client/ui';
import SettingStore from '@client/stores/SettingStore';
import SortableList, {ListItem} from '@client/components/general/SortableList';
import TorrentContextMenuActions from '@client/constants/TorrentContextMenuActions';

import type {TorrentContextMenuAction} from '@client/constants/TorrentContextMenuActions';

import type {FloodSettings} from '@shared/types/FloodSettings';

interface TorrentContextMenuActionsListProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

const lockedIDs: Array<TorrentContextMenuAction> = ['start', 'stop', 'setTaxonomy', 'torrentDetails'];

const TorrentContextMenuActionsList: FC<TorrentContextMenuActionsListProps> = ({
  onSettingsChange,
}: TorrentContextMenuActionsListProps) => {
  const [torrentContextMenuActions, setTorrentContextMenuActions] = useState(
    Object.keys(TorrentContextMenuActions).map((key) => ({
      id: key,
      visible: SettingStore.floodSettings.torrentContextMenuActions.some(
        (setting) => setting.id === key && setting.visible,
      ),
    })),
  );

  return (
    <SortableList
      id="torrent-context-menu-items"
      className="sortable-list--torrent-context-menu-items"
      items={torrentContextMenuActions}
      lockedIDs={lockedIDs}
      isDraggable={false}
      renderItem={(item: ListItem) => {
        const {id, visible} = item as FloodSettings['torrentContextMenuActions'][number];
        let checkbox = null;

        if (!lockedIDs.includes(id)) {
          checkbox = (
            <span className="sortable-list__content sortable-list__content--secondary">
              <Checkbox
                defaultChecked={visible}
                onClick={(event) => {
                  const newTorrentContextMenuActions = torrentContextMenuActions.map((setting) => ({
                    id: setting.id,
                    visible: setting.id === id ? (event.target as HTMLInputElement).checked : setting.visible,
                  }));

                  onSettingsChange({
                    torrentContextMenuActions: newTorrentContextMenuActions as FloodSettings['torrentContextMenuActions'],
                  });
                  setTorrentContextMenuActions(newTorrentContextMenuActions);
                }}>
                <Trans id="settings.ui.torrent.context.menu.items.show" />
              </Checkbox>
            </span>
          );
        }

        const content = (
          <div className="sortable-list__content sortable-list__content__wrapper">
            <span className="sortable-list__content sortable-list__content--primary">
              <Trans id={TorrentContextMenuActions[id]} />
            </span>
            {checkbox}
          </div>
        );

        return content;
      }}
    />
  );
};

export default TorrentContextMenuActionsList;
